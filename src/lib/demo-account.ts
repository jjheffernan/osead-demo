/** Browser-only demo session after /api/register or /api/login. */

export const DEMO_ACCOUNT_KEY = "osead-demo-account";

/** Known local credentials for click-through / admin testing. */
export const DEMO_ADMIN = {
  name: "Demo Admin",
  email: "admin@osead.demo",
  password: "osead-admin",
  role: "admin" as const,
};

export type DemoRole = "admin" | "user";

export interface DemoAccount {
  name: string;
  email: string;
  role: DemoRole;
  at: string;
}

export function isDemoAdminCredentials(
  email: string,
  password: string,
): boolean {
  return (
    email.trim().toLowerCase() === DEMO_ADMIN.email &&
    password === DEMO_ADMIN.password
  );
}

export function roleForEmail(email: string): DemoRole {
  return email.trim().toLowerCase() === DEMO_ADMIN.email ? "admin" : "user";
}

export function readDemoAccount(): DemoAccount | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEMO_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoAccount>;
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.at !== "string"
    ) {
      return null;
    }
    const role: DemoRole =
      parsed.role === "admin" || roleForEmail(parsed.email) === "admin"
        ? "admin"
        : "user";
    return { name: parsed.name, email: parsed.email, role, at: parsed.at };
  } catch {
    return null;
  }
}

export function writeDemoAccount(
  account: Omit<DemoAccount, "at" | "role"> & { role?: DemoRole },
): DemoAccount {
  const role = account.role ?? roleForEmail(account.email);
  const next: DemoAccount = {
    name: account.name,
    email: account.email,
    role,
    at: new Date().toISOString(),
  };
  sessionStorage.setItem(DEMO_ACCOUNT_KEY, JSON.stringify(next));
  return next;
}

export function writeDemoAdminSession(): DemoAccount {
  return writeDemoAccount({
    name: DEMO_ADMIN.name,
    email: DEMO_ADMIN.email,
    role: DEMO_ADMIN.role,
  });
}

export function clearDemoAccount(): void {
  sessionStorage.removeItem(DEMO_ACCOUNT_KEY);
}
