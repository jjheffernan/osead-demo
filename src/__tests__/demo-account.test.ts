import { describe, expect, it, vi } from "vitest";
import {
  DEMO_ACCOUNT_KEY,
  DEMO_ADMIN,
  DEMO_AGENT,
  canComment,
  canEditOwnPosts,
  canEditOwnProfile,
  canModerateSocial,
  canRate,
  canSetAnonymousListing,
  clearDemoAccount,
  hydrateDemoSessionFromCookie,
  isDemoAdminCredentials,
  readDemoAccount,
  roleForEmail,
  signOutDemo,
  writeDemoAccount,
  writeDemoAdminSession,
  type DemoRole,
} from "../lib/demo-account";

describe("demo-account session helper", () => {
  it("round-trips a local session as guest", () => {
    const store = new Map<string, string>();
    viSession(store);

    writeDemoAccount({ name: "Mara", email: "mara@example.com" });
    const read = readDemoAccount();
    expect(read?.name).toBe("Mara");
    expect(read?.email).toBe("mara@example.com");
    expect(read?.role).toBe("guest");
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

  it("round-trips a demo agent session", () => {
    const store = new Map<string, string>();
    viSession(store);

    expect(roleForEmail(DEMO_AGENT.email)).toBe("agent");

    writeDemoAccount({
      name: DEMO_AGENT.name,
      email: DEMO_AGENT.email,
      role: DEMO_AGENT.role,
    });
    const read = readDemoAccount();
    expect(read?.role).toBe("agent");
    expect(read?.email).toBe(DEMO_AGENT.email);
  });

  it("normalizes a stored legacy user role to guest", () => {
    const store = new Map<string, string>();
    viSession(store);

    store.set(
      DEMO_ACCOUNT_KEY,
      JSON.stringify({
        name: "Legacy",
        email: "legacy@example.com",
        role: "user",
        at: new Date().toISOString(),
      }),
    );

    expect(readDemoAccount()?.role).toBe("guest");
  });

  it("Wave J social/agent/admin capability matrix", () => {
    const roles: DemoRole[] = ["admin", "agent", "guest"];
    const matrix: Record<
      string,
      { fn: (role: DemoRole) => boolean; expect: [boolean, boolean, boolean] }
    > = {
      canComment: { fn: canComment, expect: [false, false, true] },
      canRate: { fn: canRate, expect: [false, false, true] },
      canEditOwnProfile: {
        fn: canEditOwnProfile,
        expect: [false, true, false],
      },
      canEditOwnPosts: { fn: canEditOwnPosts, expect: [false, true, false] },
      canModerateSocial: {
        fn: canModerateSocial,
        expect: [true, false, false],
      },
      canSetAnonymousListing: {
        fn: canSetAnonymousListing,
        expect: [true, false, false],
      },
    };

    for (const [name, { fn, expect: wanted }] of Object.entries(matrix)) {
      roles.forEach((role, i) => {
        expect(fn(role), `${name}(${role})`).toBe(wanted[i]);
      });
    }
  });

  it("hydrates from /api/session when sessionStorage is empty", async () => {
    const store = new Map<string, string>();
    viSession(store);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "Cookie Guest",
          email: "cookie@example.com",
          role: "guest",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const account = await hydrateDemoSessionFromCookie();
    expect(account?.email).toBe("cookie@example.com");
    expect(readDemoAccount()?.email).toBe("cookie@example.com");
    expect(fetchMock).toHaveBeenCalledWith("/api/session", {
      credentials: "same-origin",
    });
    vi.unstubAllGlobals();
  });

  it("signOutDemo clears local storage and POSTs logout", async () => {
    const store = new Map<string, string>();
    viSession(store);
    writeDemoAccount({ name: "Mara", email: "mara@example.com" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await signOutDemo();
    expect(readDemoAccount()).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("/api/logout", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    });
    vi.unstubAllGlobals();
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
