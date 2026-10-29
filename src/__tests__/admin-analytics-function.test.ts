import { describe, expect, it } from "vitest";
import { onRequestGet } from "../../functions/api/admin-analytics.json";
import { buildDemoAdminAnalytics } from "../lib/admin-analytics";

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

  it("returns analytics:payload with source external when OSEAD is bound", async () => {
    const stored = buildDemoAdminAnalytics(new Date("2026-01-02T00:00:00Z"));
    let key = "";
    const response = await onRequestGet({
      env: {
        OSEAD: {
          async get(name: string) {
            key = name;
            return JSON.stringify(stored);
          },
        },
      },
    });
    const payload = await response.json();
    expect(key).toBe("analytics:payload");
    expect(payload.source).toBe("external");
    expect(payload.generatedAt).toBe(stored.generatedAt);
    expect(payload.rows).toHaveLength(stored.rows.length);
  });

  it("falls back to the demo payload when the KV document is missing", async () => {
    const response = await onRequestGet({
      env: {
        OSEAD: {
          async get() {
            return null;
          },
        },
      },
    });
    const payload = await response.json();
    expect(payload.source).toBe("demo");
  });
});
