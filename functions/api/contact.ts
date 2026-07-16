type InquiryIntent = "rental" | "sale" | "booking-inquiry" | "rating";

interface ContactInquiry {
  name: string;
  email: string;
  message: string;
  intent: InquiryIntent;
  property?: string;
  checkIn?: string;
  checkOut?: string;
}

const intents = new Set<InquiryIntent>([
  "rental",
  "sale",
  "booking-inquiry",
  "rating",
]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Demo rate limit: maxRequests per windowMs per client IP (in-memory sliding window).
 * Key: CF-Connecting-IP → first X-Forwarded-For hop → "unknown".
 * Isolate-local only (cold start clears; other isolates do not share this Map).
 * Upgrade: Cloudflare Rate Limiting rules or KV when shared multi-isolate state matters.
 * See docs/afk/contact-rate-limit.md.
 */
export const CONTACT_RATE_LIMIT = {
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

/** Returns true when this IP has already used its budget in the current window. */
function isRateLimited(ip: string, now = Date.now()): boolean {
  const cutoff = now - CONTACT_RATE_LIMIT.windowMs;
  const recent = (requestTimesByIp.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= CONTACT_RATE_LIMIT.maxRequests) {
    requestTimesByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestTimesByIp.set(ip, recent);
  return false;
}

/** Test helper — clears the in-memory window store. */
export function resetContactRateLimitForTests(): void {
  requestTimesByIp.clear();
}

function text(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
}

function parseInquiry(value: unknown): ContactInquiry | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 120);
  const email = text(input.email, 254);
  const message = text(input.message, 2_000);
  const intent = input.intent;
  const property = text(input.property, 160);
  const checkIn = text(input.checkIn, 10);
  const checkOut = text(input.checkOut, 10);

  if (
    !name ||
    !email ||
    !message ||
    typeof intent !== "string" ||
    !intents.has(intent as InquiryIntent)
  ) {
    return undefined;
  }

  if (
    (checkIn && !datePattern.test(checkIn)) ||
    (checkOut && !datePattern.test(checkOut))
  ) {
    return undefined;
  }

  return {
    name,
    email,
    message,
    intent: intent as InquiryIntent,
    property,
    checkIn,
    checkOut,
  };
}

export async function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  if (
    !context.request.headers.get("Content-Type")?.includes("application/json")
  ) {
    return Response.json(
      { error: "Expected a JSON inquiry." },
      { status: 415 },
    );
  }

  if (isRateLimited(clientIp(context.request))) {
    return Response.json(
      {
        error: "Too many inquiries from this address. Please try again shortly.",
      },
      { status: 429 },
    );
  }

  let input: unknown;
  try {
    input = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON inquiry." }, { status: 400 });
  }

  // Honeypot: bots that fill `website` are rejected (no thank-you UX).
  const honeypot =
    input &&
    typeof input === "object" &&
    "website" in input &&
    typeof (input as { website: unknown }).website === "string"
      ? (input as { website: string }).website.trim()
      : "";
  if (honeypot) {
    return Response.json(
      { error: "Please provide a valid inquiry." },
      { status: 400 },
    );
  }

  const inquiry = parseInquiry(input);
  if (!inquiry || !inquiry.email.includes("@")) {
    return Response.json(
      { error: "Please provide a valid inquiry." },
      { status: 400 },
    );
  }

  // Demo-only: deployers can replace this with their CRM or mail provider.
  console.log("O-sea-D inquiry accepted", {
    intent: inquiry.intent,
    property: inquiry.property,
    checkIn: inquiry.checkIn,
    checkOut: inquiry.checkOut,
  });

  return Response.json({ accepted: true }, { status: 202 });
}
