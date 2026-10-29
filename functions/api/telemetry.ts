/**
 * Product events → Analytics Engine. Missing TELEMETRY is a no-op, not a 500.
 */

const NAME = /^[a-z][a-z0-9._]{0,63}$/;
const MAX_BLOBS = 8;
const MAX_BLOB = 128;

export interface TelemetryEvent {
  name: string;
  blobs: string[];
}

export function parseTelemetry(value: unknown): TelemetryEvent | null {
  if (!value || typeof value !== "object") return null;
  const name = (value as { name?: unknown }).name;
  if (typeof name !== "string" || !NAME.test(name)) return null;

  const raw = (value as { blobs?: unknown }).blobs;
  if (raw === undefined) return { name, blobs: [] };
  if (!Array.isArray(raw) || raw.length > MAX_BLOBS) return null;

  const blobs: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") return null;
    blobs.push(item.slice(0, MAX_BLOB));
  }
  return { name, blobs };
}

interface TelemetryEnv {
  TELEMETRY?: {
    writeDataPoint?: (point: {
      blobs: string[];
      doubles: number[];
      indexes: string[];
    }) => void;
  };
}

export async function onRequestPost(context: {
  request: Request;
  env?: TelemetryEnv;
}): Promise<Response> {
  let input: unknown;
  try {
    input = await context.request.json();
  } catch {
    input = undefined;
  }

  const event = parseTelemetry(input);
  const write = context.env?.TELEMETRY?.writeDataPoint;
  if (event && typeof write === "function") {
    write({
      blobs: [event.name, ...event.blobs],
      doubles: [1],
      indexes: [event.name],
    });
  }

  return new Response(null, { status: 204 });
}
