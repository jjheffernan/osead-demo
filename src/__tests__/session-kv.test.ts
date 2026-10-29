import { describe, expect, it } from "vitest";
import {
  clearSessionCookie,
  createSession,
  readSession,
  type SessionKv,
} from "../../functions/lib/session-kv";

function memoryKv(): SessionKv & {
  rows: Map<string, { value: string; expirationTtl?: number }>;
} {
  const rows = new Map<string, { value: string; expirationTtl?: number }>();
  return {
    rows,
    async get(key) {
      return rows.get(key)?.value ?? null;
    },
    async put(key, value, options) {
      rows.set(key, { value, expirationTtl: options?.expirationTtl });
    },
    async delete(key) {
      rows.delete(key);
    },
  };
}

describe("session KV", () => {
  it("round-trips createSession and readSession", async () => {
    const kv = memoryKv();
    const account = {
      email: "ada@example.com",
      name: "Ada Shore",
      role: "agent",
    };
    const { id, cookie } = await createSession(kv, account);

    expect(cookie).toBe(
      `osead_session=${id}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
    );
    expect(cookie).not.toContain("ada@example.com");
    expect(kv.rows.get(`session:${id}`)?.expirationTtl).toBe(604800);

    const request = new Request("https://osead.example/", {
      headers: { cookie: `osead_session=${id}` },
    });
    await expect(readSession(kv, request)).resolves.toEqual(account);
  });

  it("returns null when exp is in the past", async () => {
    const kv = memoryKv();
    await kv.put(
      "session:old",
      JSON.stringify({
        email: "ada@example.com",
        name: "Ada Shore",
        role: "agent",
        exp: Date.now() - 10_000,
      }),
    );
    const request = new Request("https://osead.example/", {
      headers: { cookie: "osead_session=old" },
    });
    await expect(readSession(kv, request)).resolves.toBeNull();
  });

  it("returns null when get returns null", async () => {
    const kv = memoryKv();
    const request = new Request("https://osead.example/", {
      headers: { cookie: "osead_session=missing" },
    });
    await expect(readSession(kv, request)).resolves.toBeNull();
  });

  it("expires the cookie and best-effort deletes the key", async () => {
    const kv = memoryKv();
    await kv.put("session:abc", "{}");
    const request = new Request("https://osead.example/", {
      headers: { cookie: "osead_session=abc" },
    });
    await expect(clearSessionCookie(kv, request)).resolves.toBe(
      "osead_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    );
    expect(kv.rows.has("session:abc")).toBe(false);
  });
});
