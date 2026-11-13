/**
 * Opaque session id → JSON record in Workers KV.
 * Cookie value is the id only.
 *
 * ponytail: revocation is not globally immediate — KV delete can lag at other
 * edges. Upgrade the session key to a Durable Object if logout must revoke
 * worldwide in one request.
 */

export interface SessionAccount {
  email: string;
  name: string;
  role: string;
}

export interface SessionKv {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

export function isKv(value: unknown): value is SessionKv {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as SessionKv).get === "function" &&
    typeof (value as SessionKv).put === "function" &&
    typeof (value as SessionKv).delete === "function"
  );
}

const COOKIE_NAME = "osead_session";
const MAX_AGE = 604800;

function sessionKey(id: string): string {
  return `session:${id}`;
}

function cookieValue(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== COOKIE_NAME) continue;
    const value = part.slice(eq + 1).trim();
    return value || null;
  }
  return null;
}

export async function createSession(
  kv: SessionKv,
  account: SessionAccount,
): Promise<{ id: string; cookie: string }> {
  const id = crypto.randomUUID();
  const exp = Date.now() + MAX_AGE * 1000;
  await kv.put(
    sessionKey(id),
    JSON.stringify({
      email: account.email,
      name: account.name,
      role: account.role,
      exp,
    }),
    { expirationTtl: MAX_AGE },
  );
  return {
    id,
    cookie: `${COOKIE_NAME}=${id}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`,
  };
}

export async function readSession(
  kv: SessionKv,
  request: Request,
): Promise<SessionAccount | null> {
  const id = cookieValue(request);
  if (!id) return null;
  const raw = await kv.get(sessionKey(id));
  if (typeof raw !== "string" || !raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  const exp = record.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp) || exp <= Date.now()) {
    return null;
  }
  if (
    typeof record.email !== "string" ||
    typeof record.name !== "string" ||
    typeof record.role !== "string"
  ) {
    return null;
  }
  return { email: record.email, name: record.name, role: record.role };
}

/** Set-Cookie that expires the session. Best-effort kv.delete; delete can lag. */
export async function clearSessionCookie(
  kv?: SessionKv,
  request?: Request,
): Promise<string> {
  const id = request ? cookieValue(request) : null;
  if (kv && id) {
    try {
      await kv.delete(sessionKey(id));
    } catch {
      // delete can lag; the expired cookie is the local signal
    }
  }
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
