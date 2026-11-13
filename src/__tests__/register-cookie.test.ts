import { afterEach, describe, expect, it } from "vitest";
import {
  onRequestPost,
  resetRegisterRateLimitForTests,
} from "../../functions/api/register";
import type { SessionKv } from "../../functions/lib/session-kv";

function memoryKv(): SessionKv & { rows: Map<string, string> } {
  const rows = new Map<string, string>();
  return {
    rows,
    async get(key) {
      return rows.get(key) ?? null;
    },
    async put(key, value) {
      rows.set(key, value);
    },
    async delete(key) {
      rows.delete(key);
    },
  };
}

afterEach(() => {
  resetRegisterRateLimitForTests();
});

describe("register cookie parity", () => {
  it("sets osead_session when OSEAD is bound", async () => {
    const kv = memoryKv();
    const response = await onRequestPost({
      request: new Request("https://osead.example/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "203.0.113.88",
        },
        body: JSON.stringify({
          name: "Coastal Guest",
          email: "new@example.com",
          password: "coastalweek",
        }),
      }),
      env: { OSEAD: kv },
    });
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      accepted: true,
      role: "guest",
    });
    const setCookie = response.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toMatch(
      /^osead_session=[0-9a-f-]{36}; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=604800$/,
    );
    expect(kv.rows.size).toBe(1);
  });

  it("skips the cookie when OSEAD is unbound", async () => {
    const response = await onRequestPost({
      request: new Request("https://osead.example/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "203.0.113.89",
        },
        body: JSON.stringify({
          name: "Coastal Guest",
          email: "local@example.com",
          password: "coastalweek",
        }),
      }),
      env: {},
    });
    expect(response.status).toBe(202);
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });
});
