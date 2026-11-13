import { describe, expect, it } from "vitest";
import { onRequestGet as getSession } from "../../functions/api/session";
import { onRequestPost as postLogout } from "../../functions/api/logout";
import {
  createSession,
  type SessionKv,
} from "../../functions/lib/session-kv";

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

describe("session + logout Functions", () => {
  it("GET /api/session returns 204 when OSEAD is unbound", async () => {
    const response = await getSession({
      request: new Request("https://osead.example/api/session"),
      env: {},
    });
    expect(response.status).toBe(204);
  });

  it("GET /api/session returns the account for a valid cookie", async () => {
    const kv = memoryKv();
    const { id } = await createSession(kv, {
      email: "guest@example.com",
      name: "guest",
      role: "guest",
    });
    const response = await getSession({
      request: new Request("https://osead.example/api/session", {
        headers: { cookie: `osead_session=${id}` },
      }),
      env: { OSEAD: kv },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      email: "guest@example.com",
      name: "guest",
      role: "guest",
    });
  });

  it("POST /api/logout expires the cookie and deletes the KV row", async () => {
    const kv = memoryKv();
    const { id } = await createSession(kv, {
      email: "guest@example.com",
      name: "guest",
      role: "guest",
    });
    expect(kv.rows.has(`session:${id}`)).toBe(true);

    const response = await postLogout({
      request: new Request("https://osead.example/api/logout", {
        method: "POST",
        headers: { cookie: `osead_session=${id}` },
      }),
      env: { OSEAD: kv },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("Set-Cookie")).toBe(
      "osead_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    );
    expect(kv.rows.has(`session:${id}`)).toBe(false);
  });
});
