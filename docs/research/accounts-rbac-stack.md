# Accounts + RBAC — auth stack research

**Status:** Phase 1 research (feeds `docs/research/accounts-rbac-feature.md`)
**Goal:** Pick the laziest auth/RBAC approach for a **demo** — `admin | agent | guest` roles, click-through seed credentials, role-gated `/account` views — that leaves a clean seam for a real IdP later **without installing one now**.

## TL;DR

Keep it 100% client-side: extend the existing `sessionStorage` pattern in `src/lib/demo-account.ts` from `admin | user` to `admin | agent | guest` (map old `user` → `guest`), add one more hard-coded demo credential (`agent@osead.demo`) alongside the existing admin one, add a handful of one-line `canX(role)` capability functions to the same file, and branch `/account` three ways (`AdminShell` / new `AgentDesk.svelte` / new `GuestHub.svelte`) using the exact hidden-div pattern `src/pages/account.astro` already uses for signed-out vs. signed-in. Don't touch `astro.config.ts` (no adapter, no `output: "server"`) and don't install anything — every real IdP option (Auth.js, Clerk, CF Access, Lucia's now-deprecated pattern) requires Astro SSR or a hosted vendor, which is a bigger lift than this demo wave needs and actively fights the "no CMS/DB/booking engine" hard rule. The seam for later isn't a new interface — it's the fact that `readDemoAccount()`/`writeDemoAccount()`/`clearDemoAccount()` are already the only 3 functions every view calls, and `login.ts`/`register.ts` already return the `{accepted, name, email, role}` shape a real session endpoint would return; swapping the demo implementation behind those exports is the whole migration.

## 1. Existing contract (what's already load-bearing)

| Piece | File | Notes |
| --- | --- | --- |
| Session I/O | `src/lib/demo-account.ts` | `sessionStorage`-backed, `DemoRole = "admin" \| "user"`, `DEMO_ADMIN` seed, `roleForEmail()`, `readDemoAccount()`/`writeDemoAccount()`/`clearDemoAccount()` |
| Login Function | `functions/api/login.ts` | Stateless — no store, no hashing, just shape validation + rate limit + `role: admin\|user` echo |
| Register Function | `functions/api/register.ts` | Stateless — accepts, never persists, client keeps the session |
| Auth UI | `src/components/account/AccountAuthForm.svelte` | Calls the Functions, falls back to a pure local session on 404 (so it also works in `astro dev` without Wrangler) |
| Gate + shells | `src/pages/account.astro` → `AdminShell.svelte` | Inline `<script>` reads `readDemoAccount()`, toggles 3 hidden `<div>`s: signed-out / plain user / admin (`AdminShell` via `client:load`) |
| Existing seed pattern | `src/config/staff.ts` | `demoStaff` — realtors already exist as content, not accounts (agent role should probably reuse these names for flavor, not wire real ownership) |

Both Functions already carry a `ponytail:` comment pointing at Auth.js/Clerk for "when accounts go live" — this research doc is about not jumping there yet, and about not blocking the jump later.

**Astro output mode matters here:** `astro.config.ts` has no `adapter` and no `output: "server"` — the site builds fully static, and `/api/*` is served by separate, stateless Cloudflare Pages Functions (`functions/`). That single fact rules out every SSR-dependent IdP option below without an unrelated infra change.

## 2. Comparison — demo pattern vs. real IdPs, for *this* stack

| Approach | New deps | Requires Astro SSR/adapter? | CF Pages fit today | Setup cost | Verdict |
| --- | --- | --- | --- | --- | --- |
| **`sessionStorage` demo (current, extended)** | none | No — works with `output: "static"` | Native — it's what's already deployed | ~30 min (role enum + 2 seed creds + 2 files) | ✅ **Recommended for this wave** |
| **Cloudflare Access** (Zero Trust) | none (npm) — `@cloudflare/pages-plugin-cloudflare-access` optional, or hand-roll ~40 lines verifying `Cf-Access-Jwt-Assertion` with Web Crypto | No SSR needed — it's an edge gate in front of Pages, validated in a `functions/_middleware.ts` | Good *product* fit long-term, poor *demo* fit — requires a Cloudflare Zero Trust team + provisioned identities/policies outside the repo before anyone can click through | Low code, non-trivial **infra** (dashboard config, team domain, per-tester identities) | ⛔ Right idea for prod gating a `/admin` path later; wrong tool for "click a demo login button" |
| **Auth.js / `auth-astro`** | `auth-astro` + `@auth/core` (+ a session store: DB adapter or JWT) | **Yes** — no official `@auth/astro` package; community integration hard-requires `output: "server"` or `"hybrid"` + an adapter (`@astrojs/cloudflare`, `@astrojs/node`, …) | Would force every route (or the touched routes in `hybrid`) through SSR; changes the build's deploy shape | Adapter install + config + provider secrets + session storage decision | ⛔ Biggest lift for a demo; real option once accounts must be real |
| **Clerk (`@clerk/astro`)** | `@clerk/astro` (hotloads `clerk-js` client bundle, ~70–100kb gz, not fully avoidable) | Yes for `clerkMiddleware()` / `context.locals.auth()` — same `output: "server"` + adapter requirement | Hosted vendor call on every auth check; needs a Clerk account + publishable/secret keys (env vars this repo doesn't have a slot for yet) | Fast to wire, but adds a hosted dependency + billing surface for a template meant to be forked | ⛔ Great for a real product, wrong for a zero-account demo template |
| **Lucia** | none installable — **the `lucia` npm package was deprecated in March 2025**; it's now a "copy the session-table pattern yourself" guide, not a library | Yes — the pattern still needs server-side cookie reads per request + a DB (D1/KV) for the session table | Same SSR requirement as Auth.js, plus a DB you don't have yet | Most hand-written code of any option, for a library that no longer exists to lean on | ⛔ More code than the demo pattern, no dependency-count benefit since it's not a dependency anymore |

**Bundle/SSR summary:** every real IdP here either (a) forces `output: "server"`/`"hybrid"` and an Astro adapter — a build-shape change this repo hasn't made — or (b) requires an external Cloudflare Zero Trust setup outside the codebase. The demo pattern requires neither, which is why it's the only option that fits "DEMO, not production IdP, this wave."

## 3. Recommendation ladder (ponytail)

1. **Does this need a new dependency?** No — `sessionStorage` + 2 stateless Functions already do everything the demo needs (see comparison above).
2. **Does it already exist in this codebase?** Yes — `demo-account.ts` is the whole session layer; extend its types and seeds instead of writing a parallel one.
3. **Standard library / native platform?** `sessionStorage` (native Web Storage) is already the mechanism; no change needed.
4. **Can capability checks be one line?** Yes — `canEditContent(role)` etc. are single-expression functions keyed off `DemoRole`, no policy engine, no decorators.
5. **Only then, write the minimum:** one enum extension, one new seed constant, ~6 one-line capability functions, two new thin Svelte shells, a 3-way (not 2-way) branch in `account.astro`, and two Function literal tweaks (`"agent"` branch alongside the existing `"admin"` check).

Nothing here is a new abstraction layer. The "seam" for later is a documentation/comment convention (§6), not a new interface, because an interface with one real implementation and one hypothetical future implementation is exactly the speculative abstraction the ladder says to skip.

## 4. `DemoRole` extension + credential seeding

```ts
export type DemoRole = "admin" | "agent" | "guest";

export const DEMO_ADMIN = { name: "Demo Admin", email: "admin@osead.demo", password: "osead-admin", role: "admin" as const };
export const DEMO_AGENT = { name: "Demo Agent", email: "agent@osead.demo", password: "osead-agent", role: "agent" as const };
// No DEMO_GUEST credential needed as a *gate* — any other 8+ char login already
// lands as guest today. A cosmetic "Continue as demo guest" button can reuse
// that same fallback path rather than a 3rd hard-coded account.
```

- `roleForEmail(email)`: admin email → `"admin"`, agent email → `"agent"`, everything else → `"guest"` (was `"user"`).
- **Backward-compat migration:** `readDemoAccount()`'s existing normalization branch (it already coerces unknown roles) gets one more case: any stored `role === "user"` (from a session written before this change) reads back as `"guest"`. No stored-data migration needed — `sessionStorage` is per-browser-session already, so old sessions age out naturally; the fallback is just so an open tab mid-deploy doesn't render broken.
- `functions/api/login.ts` and `register.ts`: the `isDemoAdmin()` helper gets a sibling `isDemoAgent()` following the identical shape; the response's `role` field becomes `admin | agent | guest` (`"guest"` replaces the literal `"user"` in the fallback).

## 5. Capability checks — plain TS, same file

Add directly to `demo-account.ts` (it's 84 lines today; a dedicated `capabilities.ts` for ~6 one-liners would be a file for the sake of a file):

```ts
export function canEditContent(role: DemoRole): boolean {
  return role === "admin";
}

export function canViewAnalytics(role: DemoRole): boolean {
  return role === "admin";
}

export function canManageInquiries(role: DemoRole): boolean {
  return role === "admin" || role === "agent";
}

export function canSaveHomes(role: DemoRole): boolean {
  return role === "guest" || role === "agent";
}
```

Call sites gate *sub-panels*, not just top-level routing — e.g. `AgentDesk.svelte` still checks `canEditContent(role)` before rendering a "jump to content editor" shortcut, the same way `AdminShell` would if an agent session ever loaded it directly by URL. This is defense-in-depth for a demo (there's no server enforcing it — see §7), but it's free and keeps every view consistent about who can do what, which matters once a real IdP starts enforcing the same checks server-side.

## 6. Gating `/account` by role

Extend `src/pages/account.astro`'s existing signed-out/user/admin 3-way hidden-div branch to a 4-way signed-out/guest/agent/admin branch:

- **`AdminShell.svelte`** — unchanged, still the full app-shell (sidebar + panel switch) for `role === "admin"`.
- **`AgentDesk.svelte`** (new) — role === `"agent"`. Reuse `AdminShell`'s outer chrome (sidebar/topbar) by literal duplication for this wave rather than extracting a shared `AccountShell` wrapper now — there's only 2 shells today; a shared layout is a rule-of-three refactor once `GuestHub` also needs it and the duplication actually hurts. Panels: assigned-inventory pulse (reuse `admin-analytics.ts` filtered to the signed-in agent's name via `employeeSales()` — already exists, no new data layer), inquiries (static/demo list), profile. No content-editor panel (`canEditContent` gates it out even if someone deep-links `#content`).
- **`GuestHub.svelte`** (new) — role === `"guest"`. Lighter than a full shell: saved homes (needs a small bit of client state — candidate for `client:visible` rather than `AdminShell`'s `client:load`, since it's below the fold and not needed for first paint), inquiry history (demo/static), deep-links out to `/rentals`, `/sales`, and the existing contact Function for booking/showing — booking itself stays external per the locked product intent in `accounts-rbac-feature.md`.
- The inline `<script>` in `account.astro` grows one more `else if (account.role === "agent")` branch; the existing admin/guest branches barely change.

## 7. The seam for a real IdP later

No new interface, no adapter class, no provider abstraction — those are exactly the "no abstractions that weren't explicitly requested" ponytail forbids when there's one real implementation. The seam is already structural:

- **Every view** (`AdminShell`, `AgentDesk`, `GuestHub`, `account.astro`) imports only `readDemoAccount` / `writeDemoAccount` / `clearDemoAccount` / the `canX()` checks from `demo-account.ts` — none of them touch `sessionStorage` directly. Swapping the demo session store for a real one (cookie + server-verified JWT, Access identity, Auth.js session, whatever) means rewriting the *inside* of those 3 functions, not their call sites.
- **The Functions' response shape** (`{accepted, name, email, role}`) already matches what a real session/callback endpoint would return. A future migration swaps `isDemoAdmin()`'s string comparison for a real credential check (or removes the Function entirely in favor of an IdP's hosted callback) without changing what `AccountAuthForm.svelte` expects back.
- **Mark the exact spots** with one more `ponytail:` comment each (matching the convention already in both Functions) at: `demo-account.ts` (session read/write), `login.ts`/`register.ts` (`onRequestPost`), and `AccountAuthForm.svelte`'s `onSubmit`. A future agent can `grep -r "ponytail:.*IdP"` and find all 5 spots instead of re-deriving the seam.
- **If/when SSR-side enforcement is needed** (i.e., a real IdP that must gate `/account/*` at the edge, not just hide it client-side), that's the point to add `output: "hybrid"` + an adapter — deliberately deferred, since it changes the whole build/deploy shape and this wave's goal is demo-only, client-side gating.

## 8. File/module touch list

| File | Change |
| --- | --- |
| `src/lib/demo-account.ts` | `DemoRole` → `admin \| agent \| guest`; add `DEMO_AGENT`; extend `roleForEmail`/normalization; add 4 `canX()` capability functions; add seam `ponytail:` comment |
| `functions/api/login.ts` | Add `isDemoAgent()` beside `isDemoAdmin()`; response `role` becomes `admin \| agent \| guest` |
| `functions/api/register.ts` | No role logic today (always accepts) — only comment/seam note, likely no functional change |
| `src/components/account/AccountAuthForm.svelte` | Add a "Continue as demo agent" button beside the existing admin one; widen the `role` prop type on `enterSession()` |
| `src/pages/account.astro` | 3-way → 4-way hidden-div branch (signed-out / guest / agent / admin); render `GuestHub`/`AgentDesk`/`AdminShell` accordingly |
| `src/components/account/AgentDesk.svelte` | **New.** Agent shell — assigned pulse, inquiries, profile |
| `src/components/account/GuestHub.svelte` | **New.** Guest shell — saved homes, inquiry history, browse CTAs |
| `src/__tests__/demo-account.test.ts` | Extend for agent role + guest fallback (old `"user"` → `"guest"` migration case) |
| `docs/research/accounts-rbac-feature.md` | Status line update once this research lands, pointing at V-slice plan |

No changes to `astro.config.ts`, `package.json`, `wrangler.toml`/Pages settings, or any new env vars.

## 9. Explicit non-goals (unchanged from the feature brief)

- Live OAuth/Clerk/Auth.js/CF Access wiring — documented here as the upgrade path only.
- Server-enforced authorization (anyone can still edit `sessionStorage` in devtools to self-promote — acceptable for a demo template, called out here so it's not mistaken for a security boundary).
- Native booking/payments, IDX/MLS sync, multi-tenant admin — per `TODO.md`/`accounts-rbac-feature.md`.
