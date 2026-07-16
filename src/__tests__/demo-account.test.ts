import { describe, expect, it } from "vitest";
import {
  DEMO_ACCOUNT_KEY,
  DEMO_ADMIN,
  clearDemoAccount,
  isDemoAdminCredentials,
  readDemoAccount,
  roleForEmail,
  writeDemoAccount,
  writeDemoAdminSession,
} from "../lib/demo-account";

describe("demo-account session helper", () => {
  it("round-trips a local session", () => {
    const store = new Map<string, string>();
    viSession(store);

    writeDemoAccount({ name: "Mara", email: "mara@example.com" });
    const read = readDemoAccount();
    expect(read?.name).toBe("Mara");
    expect(read?.email).toBe("mara@example.com");
    expect(read?.role).toBe("user");
    expect(read?.at).toMatch(/^\d{4}-/);

    clearDemoAccount();
    expect(readDemoAccount()).toBeNull();
    expect(store.has(DEMO_ACCOUNT_KEY)).toBe(false);
  });

  it("recognizes the demo admin credentials and session", () => {
    const store = new Map<string, string>();
    viSession(store);

    expect(
      isDemoAdminCredentials(DEMO_ADMIN.email, DEMO_ADMIN.password),
    ).toBe(true);
    expect(roleForEmail(DEMO_ADMIN.email)).toBe("admin");

    const admin = writeDemoAdminSession();
    expect(admin.role).toBe("admin");
    expect(readDemoAccount()?.role).toBe("admin");
  });
});

function viSession(store: Map<string, string>) {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
  });
}
