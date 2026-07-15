import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTACT_RATE_LIMIT,
  onRequestPost,
  resetContactRateLimitForTests,
} from "../../functions/api/contact";

const validInquiry = {
  name: "Taylor Shore",
  email: "taylor@example.com",
  message: "Could you share availability for this September week?",
  intent: "booking-inquiry" as const,
  property: "saltline-cottage-nags-head",
  checkIn: "2026-09-01",
  checkOut: "2026-09-08",
};

function post(
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  return onRequestPost({
    request: new Request("https://osead.example/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  });
}

afterEach(() => {
  resetContactRateLimitForTests();
});

describe("contact Pages Function", () => {
  it("accepts a valid booking inquiry", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await post(validInquiry, {
      "CF-Connecting-IP": "203.0.113.10",
    });

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(log).toHaveBeenCalledWith(
      "O-sea-D inquiry accepted",
      expect.objectContaining({ intent: "booking-inquiry" }),
    );
    log.mockRestore();
  });

  it("rejects honeypot submissions without accepting", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await post(
      { ...validInquiry, website: "https://spam.example" },
      { "CF-Connecting-IP": "203.0.113.11" },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please provide a valid inquiry.",
    });
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("returns 429 after the per-IP sliding window is exceeded", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const ip = "203.0.113.50";

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxRequests; i++) {
      const ok = await post(validInquiry, { "CF-Connecting-IP": ip });
      expect(ok.status).toBe(202);
    }

    const limited = await post(validInquiry, { "CF-Connecting-IP": ip });
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toEqual({
      error: "Too many inquiries from this address. Please try again shortly.",
    });
    expect(log).toHaveBeenCalledTimes(CONTACT_RATE_LIMIT.maxRequests);
    log.mockRestore();
  });

  it("does not rate-limit a different IP after another hits the ceiling", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxRequests; i++) {
      await post(validInquiry, { "CF-Connecting-IP": "203.0.113.60" });
    }
    const limited = await post(validInquiry, {
      "CF-Connecting-IP": "203.0.113.60",
    });
    expect(limited.status).toBe(429);

    const other = await post(validInquiry, {
      "CF-Connecting-IP": "203.0.113.61",
    });
    expect(other.status).toBe(202);
    log.mockRestore();
  });
});
