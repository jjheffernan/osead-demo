type InquiryIntent = "rental" | "sale" | "booking-inquiry";

interface ContactInquiry {
  name: string;
  email: string;
  message: string;
  intent: InquiryIntent;
  property?: string;
  checkIn?: string;
  checkOut?: string;
}

const intents = new Set<InquiryIntent>(["rental", "sale", "booking-inquiry"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

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

  let input: unknown;
  try {
    input = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON inquiry." }, { status: 400 });
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
