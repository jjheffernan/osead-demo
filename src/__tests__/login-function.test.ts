import { afterEach, describe, expect, it, vi } from "vitest";
import {
  onRequestPost,
  resetLoginRateLimitForTests,
} from "../../functions/api/login";
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

function post(
  env?: {
    OSEAD?: unknown;
    TELEMETRY?: { writeDataPoint?: (point: unknown) => void };
  },
): Promise<Response> {
  return onRequestPost({
    request: new Request("https://osead.example/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "203.0.113.77",
      },
      body: JSON.stringify({
        email: "guest@example.com",
        password: "coastalweek",
      }),
    }),
    env,
  });
}

afterEach(() => {
  resetLoginRateLimitForTests();
});

describe("login Pages Function", () => {
  it("returns 202 JSON and no cookie when OSEAD is unset", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const writeDataPoint = vi.fn();
    const response = await post({ TELEMETRY: { writeDataPoint } });

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      name: "guest",
      email: "guest@example.com",
      role: "guest",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(writeDataPoint).toHaveBeenCalledWith({
      blobs: ["session.login", "guest"],
      doubles: [1],
      indexes: ["guest"],
    });
    log.mockRestore();
  });

  it("sets osead_session when OSEAD is a KV namespace", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const kv = memoryKv();
    const response = await post({ OSEAD: kv });

    expect(response.status).toBe(202);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(
      /^osead_session=[0-9a-f-]{36}; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=604800$/,
    );
    expect(setCookie).not.toContain("guest@example.com");
    const id = setCookie.slice("osead_session=".length, setCookie.indexOf(";"));
    expect(kv.rows.has(`session:${id}`)).toBe(true);
    expect(JSON.stringify(log.mock.calls)).not.toContain(id);
    log.mockRestore();
  });
});
