import { describe, expect, it, vi } from "vitest";
import { onRequestPost } from "../../functions/api/contact";

const validInquiry = {
  name: "Taylor Shore",
  email: "taylor@example.com",
  message: "Could you share availability for this September week?",
  intent: "booking-inquiry" as const,
  property: "saltline-cottage-nags-head",
  checkIn: "2026-09-01",
  checkOut: "2026-09-08",
};

describe("contact Pages Function", () => {
  it("accepts a valid booking inquiry", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await onRequestPost({
      request: new Request("https://osead.example/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validInquiry),
      }),
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
    const response = await onRequestPost({
      request: new Request("https://osead.example/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validInquiry, website: "https://spam.example" }),
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please provide a valid inquiry.",
    });
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
