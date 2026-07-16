/**
 * Demo login — no credential store.
 * Known admin: admin@osead.demo / osead-admin (see src/lib/demo-account.ts).
 * Other emails: shape-only accept for local click-through.
 *
 * # ponytail: no real user store — Auth.js / Clerk when accounts go live.
 */

const DEMO_ADMIN_EMAIL = "admin@osead.demo";
const DEMO_ADMIN_PASSWORD = "osead-admin";

export const LOGIN_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 8,
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
  const cutoff = now - LOGIN_RATE_LIMIT.windowMs;
  const recent = (requestTimesByIp.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= LOGIN_RATE_LIMIT.maxRequests) {
    requestTimesByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestTimesByIp.set(ip, recent);
  return false;
}

export function resetLoginRateLimitForTests(): void {
  requestTimesByIp.clear();
}

function text(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
}

interface LoginBody {
  email: string;
  password: string;
}

function parseLogin(value: unknown): LoginBody | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const email = text(input.email, 254);
  const password =
    typeof input.password === "string" ? input.password : undefined;

  if (!email || !email.includes("@") || !password) return undefined;
  if (password.length < 8 || password.length > 128) return undefined;

  return { email, password };
}

function isDemoAdmin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_ADMIN_EMAIL &&
    password === DEMO_ADMIN_PASSWORD
  );
}

export async function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  if (
    !context.request.headers.get("Content-Type")?.includes("application/json")
  ) {
    return Response.json({ error: "Expected a JSON login." }, { status: 415 });
  }

  if (isRateLimited(clientIp(context.request))) {
    return Response.json(
      {
        error:
          "Too many sign-in attempts from this address. Please try again shortly.",
      },
      { status: 429 },
    );
  }

  let input: unknown;
  try {
    input = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON login." }, { status: 400 });
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
      { error: "Please provide a valid sign-in." },
      { status: 400 },
    );
  }

  const body = parseLogin(input);
  if (!body) {
    return Response.json(
      {
        error:
          "Please provide a valid email and password (at least 8 characters).",
      },
      { status: 400 },
    );
  }

  const admin = isDemoAdmin(body.email, body.password);
  const name = admin ? "Demo Admin" : body.email.split("@")[0] || "Guest";
  const role = admin ? "admin" : "user";
  console.log("O-sea-D demo login accepted", { email: body.email, role });

  return Response.json(
    { accepted: true, name, email: body.email, role },
    { status: 202 },
  );
}
