import { describe, expect, it } from "vitest";
import { onRequestGet } from "../../functions/api/admin-analytics.json";

describe("admin-analytics.json Pages Function", () => {
  it("returns the demo AdminAnalyticsPayload as JSON", async () => {
    const response = await onRequestGet();
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const payload = await response.json();
    expect(payload.source).toBe("demo");
    expect(typeof payload.generatedAt).toBe("string");
    expect(payload.currency).toBe("USD");
    expect(Array.isArray(payload.rows)).toBe(true);
    expect(payload.rows.length).toBeGreaterThan(0);
  });
});
