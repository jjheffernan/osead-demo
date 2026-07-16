/**
 * Demo account registration — no user store.
 * Accepts a well-formed signup, never logs the password, returns 202.
 * Client keeps a local session after success (see src/lib/demo-account.ts).
 *
 * # ponytail: isolate-local rate limit + no persistence — swap for Auth.js / Clerk / Workers KV when real accounts matter.
 */

export const REGISTER_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 5,
} as const;

// ponytail: in-memory / isolate-local ceiling — upgrade to CF Rate Limiting or KV for multi-isolate.
const requestTimesByIp = new Map<string, number[]>();

function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP")?.trim() ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(ip: string, now = Date.now()): boolean {
  const cutoff = now - REGISTER_RATE_LIMIT.windowMs;
  const recent = (requestTimesByIp.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= REGISTER_RATE_LIMIT.maxRequests) {
    requestTimesByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestTimesByIp.set(ip, recent);
  return false;
}

export function resetRegisterRateLimitForTests(): void {
  requestTimesByIp.clear();
}

function text(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

function parseRegister(value: unknown): RegisterBody | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 120);
  const email = text(input.email, 254);
  const password =
    typeof input.password === "string" ? input.password : undefined;

  if (!name || !email || !email.includes("@") || !password) return undefined;
  if (password.length < 8 || password.length > 128) return undefined;

  return { name, email, password };
}

export async function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  if (
    !context.request.headers.get("Content-Type")?.includes("application/json")
  ) {
    return Response.json(
      { error: "Expected a JSON registration." },
      { status: 415 },
    );
  }

  if (isRateLimited(clientIp(context.request))) {
    return Response.json(
      {
        error:
          "Too many registration attempts from this address. Please try again shortly.",
      },
      { status: 429 },
    );
  }

  let input: unknown;
  try {
    input = await context.request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON registration." },
      { status: 400 },
    );
  }

  const honeypot =
    input &&
    typeof input === "object" &&
    "website" in input &&
    typeof (input as { website: unknown }).website === "string"
      ? (input as { website: string }).website.trim()
      : "";
  if (honeypot) {
    return Response.json(
      { error: "Please provide a valid registration." },
      { status: 400 },
    );
  }

  const body = parseRegister(input);
  if (!body) {
    return Response.json(
      {
        error:
          "Please provide a name, valid email, and password (at least 8 characters).",
      },
      { status: 400 },
    );
  }

  // Demo-only: no password hash, no user table — deployer replaces with real auth.
  console.log("O-sea-D demo registration accepted", { email: body.email });

  return Response.json(
    { accepted: true, name: body.name, email: body.email },
    { status: 202 },
  );
}
