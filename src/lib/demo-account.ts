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

/** Prefer sessionStorage; if empty, try HttpOnly cookie via /api/session. */
export async function hydrateDemoSessionFromCookie(): Promise<DemoAccount | null> {
  const existing = readDemoAccount();
  if (existing) return existing;
  if (typeof fetch === "undefined") return null;
  try {
    const response = await fetch("/api/session", { credentials: "same-origin" });
    if (response.status === 204 || !response.ok) return null;
    const body = (await response.json()) as Partial<DemoAccount>;
    if (
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      (body.role !== "admin" &&
        body.role !== "agent" &&
        body.role !== "guest")
    ) {
      return null;
    }
    return writeDemoAccount({
      name: body.name,
      email: body.email,
      role: body.role,
    });
  } catch {
    return null;
  }
}

/** Clear local session and best-effort expire the KV cookie. */
export async function signOutDemo(): Promise<void> {
  clearDemoAccount();
  if (typeof fetch === "undefined") return;
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    });
  } catch {
    /* offline / unbound — local clear is enough */
  }
}

export const canEditContent = (role: DemoRole): boolean => role === "admin";
export const canViewAnalytics = (role: DemoRole): boolean => role === "admin";
export const canManageInquiries = (role: DemoRole): boolean =>
  role === "admin" || role === "agent";
export const canSaveHomes = (role: DemoRole): boolean =>
  role === "guest" || role === "agent";
export const canAccessAdminShell = (role: DemoRole): boolean =>
  role === "admin";
export const canComment = (role: DemoRole): boolean => role === "guest";
export const canRate = (role: DemoRole): boolean => role === "guest";
export const canEditOwnProfile = (role: DemoRole): boolean => role === "agent";
export const canEditOwnPosts = (role: DemoRole): boolean => role === "agent";
export const canModerateSocial = (role: DemoRole): boolean => role === "admin";
export const canSetAnonymousListing = (role: DemoRole): boolean =>
  role === "admin";
