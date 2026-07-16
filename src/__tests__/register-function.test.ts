import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REGISTER_RATE_LIMIT,
  onRequestPost,
  resetRegisterRateLimitForTests,
} from "../../functions/api/register";

const valid = {
  name: "Taylor Shore",
  email: "taylor@example.com",
  password: "coastalweek",
};

function post(
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  return onRequestPost({
    request: new Request("https://osead.example/api/register", {
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
  resetRegisterRateLimitForTests();
});

describe("register Pages Function", () => {
  it("accepts a valid registration without logging the password", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await post(valid, { "CF-Connecting-IP": "203.0.113.20" });

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      name: "Taylor Shore",
      email: "taylor@example.com",
    });
    expect(log).toHaveBeenCalledWith(
      "O-sea-D demo registration accepted",
      { email: "taylor@example.com" },
    );
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).not.toContain("coastalweek");
    log.mockRestore();
  });

  it("rejects short passwords", async () => {
    const response = await post(
      { ...valid, password: "short" },
      { "CF-Connecting-IP": "203.0.113.21" },
    );
    expect(response.status).toBe(400);
  });

  it("rejects honeypot submissions", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await post(
      { ...valid, website: "https://spam.example" },
      { "CF-Connecting-IP": "203.0.113.22" },
    );
    expect(response.status).toBe(400);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("returns 429 after the per-IP window is exceeded", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const ip = "203.0.113.60";

    for (let i = 0; i < REGISTER_RATE_LIMIT.maxRequests; i++) {
      const ok = await post(valid, { "CF-Connecting-IP": ip });
      expect(ok.status).toBe(202);
    }

    const limited = await post(valid, { "CF-Connecting-IP": ip });
    expect(limited.status).toBe(429);
    log.mockRestore();
  });
});
