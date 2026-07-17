/** Browser-only demo session after /api/register or /api/login. */

import { demoStaff } from "../config/staff";

export const DEMO_ACCOUNT_KEY = "osead-demo-account";

/** Known local credentials for click-through / admin testing. */
export const DEMO_ADMIN = {
  name: "Demo Admin",
  email: "admin@osead.demo",
  password: "osead-admin",
  role: "admin" as const,
};

/** Known local credentials for click-through / agent testing. */
export const DEMO_AGENT = {
  name: "Demo Agent",
  email: "agent@osead.demo",
  password: "osead-agent",
  role: "agent" as const,
};

export type DemoRole = "admin" | "agent" | "guest";

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

const agentAllowlist = new Set([
  DEMO_AGENT.email,
  ...demoStaff.map((staff) => `${staff.id}@osead.demo`),
]);

export function roleForEmail(email: string): DemoRole {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_ADMIN.email) return "admin";
  if (agentAllowlist.has(normalized)) return "agent";
  return "guest";
}

// ponytail: session read/write is the real-IdP seam — a future OAuth/Clerk/Auth.js
// swap replaces roleForEmail()/sessionStorage here without touching call sites.
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
        : roleForEmail(parsed.email);
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

export const canEditContent = (role: DemoRole): boolean => role === "admin";
export const canViewAnalytics = (role: DemoRole): boolean => role === "admin";
export const canManageInquiries = (role: DemoRole): boolean =>
  role === "admin" || role === "agent";
export const canSaveHomes = (role: DemoRole): boolean =>
  role === "guest" || role === "agent";
export const canAccessAdminShell = (role: DemoRole): boolean =>
  role === "admin";
