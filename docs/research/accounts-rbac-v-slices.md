# Accounts + RBAC — Phase 1 synthesis → Phase 2 V-slice build plan

Final synthesizer output for the accounts-rbac feature push (see `docs/research/accounts-rbac-feature.md`). Inputs: `accounts-rbac-platforms.md`, `accounts-rbac-stack.md`, `accounts-rbac-validation-platforms.md`, `accounts-rbac-validation-stack.md`, plus live code (`src/lib/demo-account.ts`, `src/pages/account.astro`, `src/components/account/{AccountAuthForm,AdminShell}.svelte`, `functions/api/{login,register}.ts`, `src/components/properties/AvailabilityInquiry.svelte`, `src/config/staff.ts`).

**One-line goal:** grow the demo session contract from `admin | user` to `admin | agent | guest` with three role-gated `/account` shells (AdminShell / AgentDesk / GuestHub) — guest saves + inquiry history in `localStorage`, agent inbox + market-scoped inventory from data that already exists — **zero new dependencies**, client-side only, offline-safe, real-IdP seam left intact.

## Locked decisions (do not relitigate in Phase 2)

- **`DemoRole = "admin" | "agent" | "guest"`.** Old `"user"` maps to `"guest"` everywhere (types, Functions, normalization ternary, copy). No stored-data migration — `sessionStorage` ages out per browser session; the normalization branch only stops a mid-deploy open tab from rendering broken.
- **Zero new deps, zero infra change.** No `astro.config.ts` `output`/`adapter` change, no `package.json` add, no new env var, no KV/D1. Every SSR-requiring IdP (Auth.js/Clerk) and Cloudflare Access is out of scope this wave — documented as the upgrade path only (`accounts-rbac-stack.md` §7).
- **Booking stays faux → `/contact` deep links.** Do **not** add an `externalBookingUrl` frontmatter field or a `buildExternalBookingUrl()` helper. The "continue to book" handoff is `AvailabilityInquiry.svelte`'s existing `window.location.assign('/contact?intent=booking-inquiry&property&checkIn&checkOut')` — reuse it; the guest side just persists its own copy of that payload. (`accounts-rbac-validation-platforms.md` §2.)
- **Agent pulse is a labeled sample.** `StaffMember` has no `email` and `DEMO_AGENT.name` isn't in `demoStaff`, so there is no session→staff link to filter by. Reuse `AdminShell`'s existing `employeeSales(rows)` derivation, sliced, under an explicit "Sample assigned pulse (demo)" label. Do **not** invent a name-string match or a mapping table.
- **Agent allowlist from `demoStaff` + hard-coded `DEMO_AGENT`.** `roleForEmail()` → admin email = `admin`, agent allowlist (a `DEMO_AGENT` seed email, optionally `<id>@osead.demo` for each `demoStaff` id) = `agent`, everything else = `guest`.
- **Guest state is `localStorage`.** `savedListingSlugs: string[]` (toggle by `slug`) + `inquiries: {propertySlug, intent, checkIn?, checkOut?, submittedAt}[]` (mirror of the `ContactInquiry` shape the `/contact` Function already accepts; status is always "submitted" — no fake pipeline).
- **Capability helpers live in `demo-account.ts`** (not a new file): `canEditContent`, `canViewAnalytics`, `canManageInquiries`, `canSaveHomes`, `canAccessAdminShell`. One-line each, keyed only off `DemoRole`.
- **`account.astro` branches three shells:** `AdminShell` (unchanged) / `AgentDesk` (new) / `GuestHub` (new). The binary `admin`-vs-`else` branch becomes a real 4-state gate (signed-out / guest / agent / admin).
- **Fix duplicated role literals in `AccountAuthForm.svelte`** — it has two independent `role?: "admin" | "user"` unions that don't import `DemoRole`; import the type instead so widening `DemoRole` can't leave it stale.
- **Not a security boundary.** Client-side gating only; anyone can edit `sessionStorage` to self-promote. Called out so it isn't mistaken for enforcement. Sub-panels still call `canX()` (defense-in-depth, free, keeps parity for a future server-side IdP).

## Build waves

Ordered so each slice is independently shippable and later slices can't silently break earlier ones (a broken client-side branch fails as a blank div, not an error — so each UI slice needs a manual click-through). Foundation first (types + Functions + auth form + branch skeleton), then guest (lighter shell, lower risk), then agent, then janitor.

| Wave | Slices | Theme | Blast radius |
| --- | --- | --- | --- |
| **I·A** | I1–I4 | Role foundation: types, capabilities, Functions, auth form, 4-way branch | `demo-account.ts`, `functions/api/*`, `AccountAuthForm.svelte`, `account.astro` |
| **I·B** | I5–I7 | Guest: local store + GuestHub shell + save/inquiry wiring | `src/lib/guest-store.ts` (new), `GuestHub.svelte` (new), PDP + `AvailabilityInquiry.svelte` |
| **I·C** | I8–I9 | Agent: static assignment config + AgentDesk shell | `src/config/agent-assignments.ts` (new), `AgentDesk.svelte` (new), `account.astro` |
| **I·D** | I10 | Janitor + docs status | Wave I files, `docs/research/accounts-rbac-feature.md` |

Each slice = one commit on `main` (no PR, no HITL). Every acceptance ends in `pnpm build` green plus a concrete click-through; the two pure-logic slices (I1, I5) also carry a runnable test.

---

## Wave I·A — Role foundation

### I1 — Widen `DemoRole` + capability helpers
- **Goal:** extend the session contract to `admin | agent | guest`, seed the agent credential, and add the five capability one-liners — the load-bearing type change every later slice imports.
- **Primary files:** `src/lib/demo-account.ts`, `src/__tests__/demo-account.test.ts`.
- **How:** `DemoRole = "admin" | "agent" | "guest"`; add `DEMO_AGENT` (`agent@osead.demo` / `osead-agent`, `role: "agent"`); rewrite `roleForEmail()` → admin email = `admin`, agent allowlist (`DEMO_AGENT.email` + optional `<staff-id>@osead.demo` from `demoStaff`) = `agent`, else `guest`; widen `readDemoAccount()`'s normalization ternary so any stored `"user"`/unknown non-admin reads back as `"guest"`. Add `canEditContent`/`canViewAnalytics` (admin), `canManageInquiries` (admin||agent), `canSaveHomes` (guest||agent), `canAccessAdminShell` (admin). Add one `ponytail:` seam comment at the session read/write pointing at the future IdP swap. Extend the test: round-trip an agent session, and assert a stored `role: "user"` reads back as `"guest"`.
- **Acceptance:** `pnpm build` green; `pnpm test` (or the vitest run in `pnpm lint`) passes the new agent + `"user"`→`"guest"` cases.
- **Deps:** none (foundation).
- **Do not:** add a `capabilities.ts` file (five one-liners don't earn a file); add a name→staff mapping table; migrate stored data.

### I2 — Role widening in the auth Functions
- **Goal:** make the stateless `/api/login` echo the new role union so a Cloudflare-served session matches the local one.
- **Primary files:** `functions/api/login.ts`, `functions/api/register.ts`.
- **How:** in `login.ts`, add `isDemoAgent(email, password)` beside `isDemoAdmin()` (same shape, checks `DEMO_AGENT`); the `role` literal becomes `admin ? "admin" : agent ? "agent" : "guest"` (`"guest"` replaces the `"user"` fallback on line 128). `register.ts` assigns no role today — add only the `ponytail:` seam comment, no functional change (validation confirmed none needed).
- **Acceptance:** `pnpm build` green; POST `agent@osead.demo` + `osead-agent` to `/api/login` returns `{role:"agent"}`, any other 8+ char login returns `{role:"guest"}`, admin still returns `{role:"admin"}` (verify via the existing function tests or a curl against `wrangler pages dev`).
- **Deps:** I1 (imports `DEMO_AGENT`/role type).
- **Do not:** add password hashing, a user store, or a third role that isn't gated by a seed credential.

### I3 — AccountAuthForm: import `DemoRole`, add demo-agent button
- **Goal:** kill the duplicated role literals and give click-through access to the agent session.
- **Primary files:** `src/components/account/AccountAuthForm.svelte`.
- **How:** import `DemoRole` from `demo-account.ts` and replace both inline `role?: "admin" | "user"` unions (on `enterSession()` and the fetch-body type) with it. Add a "Continue as demo agent" button beside "Continue as demo admin" (reuse the `.account-auth__admin` block/markup pattern; write a `DEMO_AGENT` session via `writeDemoAccount`). Update the login helper copy to mention agent + guest instead of "plain user".
- **Acceptance:** `pnpm build` green; on `/login`, "Continue as demo agent" lands on `/account` as an agent session; existing admin button + email/password fallback still work.
- **Deps:** I1.
- **Do not:** re-type the role union as a literal anywhere; add a third hard-coded guest credential (any other login already lands as guest).

### I4 — `account.astro` 4-way branch (with placeholder shells)
- **Goal:** turn the binary admin/else branch into a real signed-out / guest / agent / admin gate, with the guest+agent panels stubbed so islands can be dropped in next.
- **Primary files:** `src/pages/account.astro`.
- **How:** rename `data-account-user` → `data-account-guest` (markup + `<script>` querySelector); add a `data-account-agent` panel; split the trailing `else` into explicit `role === "agent"` / `role === "guest"` branches gated via the `canAccessAdminShell`/role checks; rewrite the stale "This session is a plain user" copy; extend the `body:has(...)` global CSS selector to include `data-account-agent` (agent is a full app-shell like admin; guest stays lighter and doesn't need it). Fill agent/guest panels with placeholder markup for now (real islands land in I6/I9).
- **Acceptance:** `pnpm build` green; signed-out shows the gate, admin still loads `AdminShell`, agent + guest each show their (placeholder) panel with correct name/email/session-time; no blank div for any of the four states.
- **Deps:** I1 (role checks), I3 (produces agent sessions to test).
- **Do not:** leave a `data-account-user` attribute rendering guest content; add the `:has()` selector for the guest panel unless it actually needs shell chrome.

---

## Wave I·B — Guest

### I5 — Guest local store (saved slugs + inquiry mirror)
- **Goal:** the pure client-side persistence layer for the guest role — testable in isolation before any UI rides on it.
- **Primary files:** `src/lib/guest-store.ts` (new), `src/__tests__/guest-store.test.ts` (new).
- **How:** mirror `demo-account.ts`'s own `localStorage` shape. Export `toggleSavedListing(slug)`, `readSavedListings(): string[]`, `isSaved(slug)`, `addInquiry(record)`, `readInquiries()`. `Inquiry` = `{propertySlug, intent, checkIn?, checkOut?, submittedAt}` (subset of the `ContactInquiry` shape; status is always implicitly "submitted"). Guard `typeof localStorage === "undefined"` like `readDemoAccount()` does. Test against a fake `localStorage` (copy the pattern in `demo-account.test.ts`): toggle on/off round-trips, adding an inquiry appends and persists.
- **Acceptance:** `pnpm build` green; `pnpm test` passes the new store round-trip cases.
- **Deps:** none (pure logic; parallel-safe with I·A but sequence after so the wave stays ordered).
- **Do not:** invent a `status: "confirmed"` field (no real pipeline); add a server round-trip; reach for a state library.

### I6 — GuestHub shell
- **Goal:** the guest `/account` experience — saved homes, inquiry history, browse CTAs.
- **Primary files:** `src/components/account/GuestHub.svelte` (new), `src/pages/account.astro`.
- **How:** lighter than a full app-shell (no sidebar). Read `guest-store.ts` for saved slugs (resolve to property title/href via the `inventory`/collections already loaded in `account.astro`, passed as a prop) and inquiry history; render a "Saved homes" list (empty state → link to `/rentals`), an "Inquiry history" list (property + dates + submitted-at, labeled "submitted"), and browse/contact CTAs. Mount in `account.astro`'s guest branch via `client:visible` (below the fold, not needed for first paint). Include a "message your agent" `/contact` link per the platforms research's "visible line to a human agent."
- **Acceptance:** `pnpm build` green; a guest session renders saved homes + inquiry history (seeded via devtools `localStorage` or after I7); empty states read cleanly; CTAs navigate.
- **Deps:** I4 (branch), I5 (store).
- **Do not:** show any admin/agent panel, financials, or a fake in-site checkout; import `.astro` components into the island.

### I7 — Save toggle + inquiry mirror wiring
- **Goal:** make the guest data real — a "save this home" control on the PDP and an inquiry-history write on the existing booking deep link.
- **Primary files:** `src/components/account/SaveHomeButton.svelte` (new), the property detail page/section that renders a single listing, `src/components/properties/AvailabilityInquiry.svelte`.
- **How:** `SaveHomeButton` is a tiny `client:visible` island calling `toggleSavedListing(slug)`/`isSaved(slug)`, placed on the PDP (only `canSaveHomes` roles see the saved state persisted; button can render for anyone, guest is where it matters). In `AvailabilityInquiry.svelte`, on the existing successful "check availability" path, call `addInquiry({...})` with the same `intent=booking-inquiry` + dates payload right before `window.location.assign('/contact?...')` — no new field, no Function change.
- **Acceptance:** `pnpm build` green; on a PDP, clicking "Save" toggles and persists across reload; submitting the availability form adds a row to GuestHub's inquiry history.
- **Deps:** I5 (store), I6 (surface to view the result).
- **Do not:** add save toggles to every listing card this wave (PDP only — daylight can spread it); add an `externalBookingUrl` field; change the `/contact` Function.

---

## Wave I·C — Agent

### I8 — Static agent assignment + inventory config
- **Goal:** the lightest possible "assigned inventory" seam — a plain config array, not a schema field or DB.
- **Primary files:** `src/config/agent-assignments.ts` (new).
- **How:** same weight class as `staff.ts`/`marketplaces.ts` — a small in-repo array mapping a few demo inquiry fixtures (property slug + dates + intent, "assigned via market rotation") to a `demoStaff` id, plus an agent→`market` map (`outer-banks | jersey-shore | delaware-beaches | other-coastal`, using the `market` field every property already has). Export a helper to select the fixtures + market for the active demo agent (default to `demoStaff[0]` / `DEMO_AGENT` per the locked "sample" decision).
- **Acceptance:** `pnpm build` green; importing the config returns a non-empty assigned-inquiry list and a market for the demo agent; TS types check.
- **Deps:** none (config only; sequence in-wave).
- **Do not:** add an `agentId` frontmatter field to properties; add lead-routing logic/UI; add a `StaffMember.email` field.

### I9 — AgentDesk shell
- **Goal:** the agent `/account` experience — inbox (assigned inquiries) + market-scoped inventory + profile + labeled sample pulse.
- **Primary files:** `src/components/account/AgentDesk.svelte` (new), `src/pages/account.astro`.
- **How:** reuse `AdminShell`'s outer chrome by literal duplication (only two shells today — a shared `AccountShell` is a rule-of-three refactor for later). Panels: **Inbox** (assigned inquiries from I8, "assigned via market rotation" label); **My inventory** (filter the `inventory`/properties already passed to `account.astro` down to the agent's assigned `market`, read-only); **Profile** (render the agent's `demoStaff` bio/role); **Sample pulse** (reuse `employeeSales(rows)` sliced, under an explicit "Sample assigned pulse (demo)" label). Gate out any content-editor/analytics shortcut with `canEditContent`/`canViewAnalytics` even on deep-link. Mount via `client:load` in `account.astro`'s agent branch.
- **Acceptance:** `pnpm build` green; an agent session shows inbox + market-scoped inventory + profile + the labeled sample pulse; no content-editor or site-wide analytics panel; deep-linking `#content` shows nothing editable.
- **Deps:** I4 (branch + `:has()` selector), I8 (assignment data).
- **Do not:** clone the AdminShell content/analytics panels; show real money; build a two-way message thread (a `/contact` link naming the agent is the ceiling).

---

## Wave I·D — Close-out

### I10 — Janitor + docs status
- **Goal:** drift pass across Wave I files and point the feature doc at the built slice.
- **Primary files:** Wave I files (as needed), `docs/research/accounts-rbac-feature.md`.
- **How:** token/spacing/TS-drift sweep (semantic tokens only, no Tailwind palette utils, no `role` literals re-duplicated, no dead `data-account-user`); confirm no new dep landed; update the feature doc's status line to point at this V-slice plan as built. `pnpm build` + `pnpm lint` (includes `check:kpis`) green.
- **Acceptance:** clean tree; `pnpm build` + `pnpm lint` green; commit `chore(i): janitor after accounts + RBAC` (or note PASS with no changes needed).
- **Deps:** I1–I9.
- **Do not:** extract a shared `AccountShell` (defer to daylight rule-of-three); add features beyond drift cleanup.

---

## Out of scope (this wave)

- Live OAuth / Clerk / Auth.js / Cloudflare Access wiring — documented plug shape only (`accounts-rbac-stack.md` §7). Any of these forces `output: "server"`/`"hybrid"` + an adapter or external Zero Trust infra: a build-shape change this wave doesn't make.
- Server-enforced authorization / step-up reauth for financial views (sound UX vocabulary, no backend to enforce it here).
- `externalBookingUrl` frontmatter, `buildExternalBookingUrl()`, or any third-party booking-engine handoff (tier 2 magic link / tier 3 SSO). Booking stays the internal `/contact` deep link.
- IDX/MLS search, owner/agent financials, lead-routing configuration UI, two-way message threads, native app group-voting.
- A shared `AccountShell` wrapper (rule-of-three refactor — deferred).
- Spreading the save toggle across listing cards, magic-link re-entry, real per-agent staff email mapping (all daylight/Phase 3).

## Definition of done

**Phase 2 (after-hours, this plan):** I1–I10 committed on `main`. `pnpm build` + `pnpm lint` green after each. Manual click-through of all four states (`admin@osead.demo`, `agent@osead.demo`, any-other-email as guest, signed-out) renders the correct shell with no blank div. Guest saves + inquiry history persist across reload; agent inbox + market inventory + labeled sample pulse render; zero new npm deps; no `astro.config.ts`/`package.json`/env changes.

**Phase 3 (daylight):** push; UX densify (spread save toggle to cards, tighten shells); consider the shared `AccountShell` if a fourth shell appears; document (don't build) the real-IdP swap behind the `ponytail:` seams; optional outbound email (magic link) only if secrets present.
