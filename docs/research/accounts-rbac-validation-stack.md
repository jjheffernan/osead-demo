# Accounts + RBAC — stack research validation

**Status:** Phase 1 validation of `docs/research/accounts-rbac-stack.md` against the actual codebase
**Verdict:** Agree with the ladder and the recommendation. Zero-new-deps holds. Two concrete gaps found that the AFK build order must account for (§3, §4) — neither changes the recommendation, both are cheap to close.

## TL;DR

`accounts-rbac-stack.md` is directionally and technically correct: `astro.config.ts` really has no adapter and no `output` override (Astro 7 defaults to static), `package.json` has zero auth-adjacent dependencies, and the demo `sessionStorage` pattern really is the only load-bearing session layer. Every SSR/vendor objection to Auth.js/Clerk/CF Access checks out against the real config, not just against general knowledge of those libraries. Two things in the doc are optimistic and need correcting before build: (1) `employeeSales()` returns **all** staff, not one filtered agent — there is no `employeeId`/email link between a demo agent account and `demoStaff`, so "reuse `employeeSales()` filtered to the signed-in agent" doesn't work as written; (2) `account.astro`'s branch is binary today (admin vs. everything-else), not 3-way, so going to 4-way is a bigger edit than "one more `else if`," and two other files (`AccountAuthForm.svelte`'s literal role types, the hardcoded "plain user" copy) duplicate the role union outside `demo-account.ts` and will silently stay stale if only `DemoRole` is widened.

## 1. sessionStorage extension — confirmed correct

Read `src/lib/demo-account.ts` directly. The doc's description matches the file exactly:

- `DemoRole = "admin" | "user"` (line 13), `DEMO_ADMIN` seed (lines 6–11), `roleForEmail()` (line 32), `readDemoAccount()`/`writeDemoAccount()`/`clearDemoAccount()` (lines 36, 59, 81) — the only three exports every call site uses. Confirmed via `AdminShell.svelte` (`readDemoAccount`, `clearDemoAccount`), `AccountAuthForm.svelte` (`writeDemoAccount`, `writeDemoAdminSession`), and `account.astro`'s inline script (`readDemoAccount`, `clearDemoAccount`) — no file touches `sessionStorage` directly except `demo-account.ts` itself.
- `functions/api/login.ts` and `register.ts` are confirmed stateless: no store, no hashing, `Map`-based in-memory rate limiting only (already `ponytail:`-flagged as isolate-local), shape validation, and a literal `role = admin ? "admin" : "user"` echo in `login.ts` line 128. `register.ts` never assigns a role at all (line 61 doc's "no functional change" claim is correct — it always returns `{accepted, name, email}` with no `role` key).
- `readDemoAccount()`'s normalization (lines 49–52) already coerces any non-`"admin"` stored role to `"user"` — the doc's claim that the `"user"` → `"guest"` migration is "one more case, no stored-data migration needed" is accurate; it's the same ternary, just widened.
- The existing test file (`src/__tests__/demo-account.test.ts`) round-trips a plain session and the admin session against a fake `sessionStorage` — this is a real, cheap pattern to extend for the agent/guest cases, exactly as the doc's touch list proposes.

**No disagreement here.** This is the correct, minimal extension of what's already load-bearing.

## 2. SSR/adapter challenge — confirmed against actual config, not general knowledge

Read `astro.config.ts` and `package.json` directly.

- `astro.config.ts`'s `defineConfig()` has **no `adapter` key and no `output` key at all** — Astro 7 defaults `output` to `"static"` when unset. This is a directly-verified fact, not an inference: the config has `integrations`, `env`, `vite`, `build.format`, `markdown`, `image`, `security` blocks, and nothing else. `functions/api/*.ts` are plain Cloudflare Pages Functions (the `onRequestPost` export convention), entirely separate from Astro's routing/rendering — confirmed by both `login.ts` and `register.ts`'s signatures.
- `package.json` has zero adapter packages (no `@astrojs/cloudflare`, `@astrojs/node`, `@astrojs/vercel`, etc.) and zero auth packages (no `auth-astro`, `@auth/core`, `@clerk/astro`, `lucia`). The dependency list is fonts, Tailwind, Svelte, Astro core, `zod`, `schema-dts`, `sharp`, `clsx`/`cva`/`tailwind-merge` — nothing that changes this analysis.
- This validates the doc's central claim: **every SSR-requiring option (Auth.js/`auth-astro`, Clerk) would force a build-shape change** (`output: "hybrid"`/`"server"` + installing and configuring an adapter) that doesn't exist today, on top of installing the auth package itself. The doc is not overstating the lift — it's a compounding cost (adapter + auth lib + provider config + secrets), not just "one dependency."
- Cloudflare Access verdict also confirmed reasonable: it's genuinely adapter-free (edge-gate in front of static Pages), but it requires provisioning a Zero Trust team/identities in the Cloudflare dashboard — infra outside this repo, wrong fit for "click a demo button," which is what the doc concludes.

**No disagreement here either.** The doc didn't hand-wave the SSR objection — it's backed by what's actually in the config.

## 3. Capability functions + role matrix — mostly correct, one real gap

### Capability functions: names hold, keep them

The four proposed functions (`canEditContent`, `canViewAnalytics`, `canManageInquiries`, `canSaveHomes`) are the right shape — one-line, keyed only off `DemoRole`, no policy engine. Recommend one addition and one rename for clarity once three shells exist, not two:

| Function | Admin | Agent | Guest | Used by |
| --- | --- | --- | --- | --- |
| `canEditContent(role)` | ✅ | ❌ | ❌ | `AdminShell` content panel; gate for deep-linked `#content` from any shell |
| `canViewAnalytics(role)` | ✅ | ❌ (agent gets its own scoped pulse, not the analytics panel) | ❌ | `AdminShell` analytics panel |
| `canManageInquiries(role)` | ✅ | ✅ | ❌ | `AdminShell`/`AgentDesk` inquiries panel |
| `canSaveHomes(role)` | ❌ | ✅ | ✅ | `AgentDesk`/`GuestHub` — **doc has this backwards for admin**, see below |
| `canAccessAdminShell(role)` *(new, trivial)* | ✅ | ❌ | ❌ | `account.astro`'s branch itself — the doc has no capability function gating which shell loads, only sub-panels inside a shell; adding this one keeps `account.astro`'s branch consistent with the same `canX` convention instead of hand-rolling `role === "admin"` inline in one more place |

Flag on `canSaveHomes`: the doc's code block (`accounts-rbac-stack.md` §5) returns `role === "guest" || role === "agent"` — that's *guest or agent* can save homes, which matches the role matrix intent (admin doesn't shop), but the doc's prose in §6 never says admin should also be excluded from `GuestHub`-style saved-homes UI, and no shell currently plans to show that panel to admin anyway, so this is consistent — just noting it explicitly since "which two of three roles" functions are the easiest place for an off-by-one role to slip in during implementation.

### Role matrix (fits AdminShell / AgentDesk / GuestHub)

| Capability | admin | agent | guest |
| --- | --- | --- | --- |
| Full content edit (`ContentEditor`) | ✅ | ❌ | ❌ |
| Site-wide analytics (`AdminAnalytics`) | ✅ | ❌ | ❌ |
| Own-assigned inventory pulse | n/a (sees all via analytics) | ✅ (scoped) | n/a |
| Manage inquiries | ✅ | ✅ | ❌ (can only view own history) |
| Saved homes / browse CTAs | ❌ | n/a | ✅ |
| Sign out / profile | ✅ | ✅ | ✅ |

### The real gap: "reuse `employeeSales()` filtered to the signed-in agent" doesn't work as written

Read `src/lib/admin-analytics.ts` and `src/config/staff.ts` directly. `employeeSales(rows)` (lines 243–266) always maps over **all** of `demoStaff` and returns one `EmployeeSalesRow` per staff member — it has no filter parameter and no concept of "the signed-in agent." Filtering to one employee is `filterAdminRows(rows, { employeeId: "<staff-id>", market: "all" })` → `summarizeRows(...)`, a *different* pair of functions than the ones the doc names.

More importantly: **there is no link between a demo agent's session (`email: "agent@osead.demo"`, `name: "Demo Agent"`) and any `employeeId` in `demoStaff`** (`mara-ellison`, `jonah-reed`, `priya-santos`, `cole-brennan`). `StaffMember` has no `email` field at all. So "assigned-inventory pulse... filtered to the signed-in agent's name" has no data to filter *by* — `DEMO_AGENT`'s name isn't in `demoStaff`, and matching by literal name string is the wrong direction anyway (fragile, and the doc's own §6 already says agent role should "reuse these names for flavor, not wire real ownership").

This doesn't break the recommendation, but the AFK build order needs an explicit decision here (pick one, don't invent a mapping table — that's a new abstraction the ladder would reject):

- **Cheapest, recommended:** `AgentDesk`'s pulse shows `employeeSales(rows).slice(0, 1)` — i.e., literally reuse `AdminShell`'s existing `topStaff` derivation but slice to the *first* row instead of top 3, with a UI label like "Sample assigned pulse (demo)" instead of pretending it's actually scoped to the logged-in agent. Zero new code beyond what `AdminShell` already has; honest about being a demo.
- **If "assigned to me" framing is required:** pick `demoStaff[0]` (`mara-ellison`) as the fixed demo-agent's staff identity and filter with `filterAdminRows(rows, { employeeId: "mara-ellison", market: "all" })`, same functions `AdminShell`'s own filter UI already calls. One constant, no new file, no new type.

Either way: **no new data layer, no new dependency** — the doc's top-level claim survives, just not through the specific function name it named.

## 4. File conflict risks — `account.astro` is a bigger edit than "one more `else if`"

Read `src/pages/account.astro` directly, including the inline `<script>` and the global style block.

1. **The branch is binary today, not 3-way.** Lines 140–155: `if (!account) { signedOut }` → `else if (account.role === "admin") { adminEl }` → `else { userEl }`. There is no distinct "user" check — anything non-admin falls into the same `else`. Going to a real 4-way (signed-out / guest / agent / admin) means turning that trailing `else` into two explicit branches (`role === "agent"` / `role === "guest"` or default), not literally adding "one more `else if`" as §6 states. Small difference in effort, but worth calling out so the AFK agent doesn't under-scope this file.
2. **Hardcoded "plain user" copy will go stale.** Lines 100–103: `<p>Admin tools appear only for <code>admin@osead.demo</code>. This session is a plain user.</p>` is static markup inside the `data-account-user` div, not driven by role. If that div is reused/renamed for `guest`, this sentence needs rewriting (agent isn't a "plain user" either) — it's a content edit, not just a script-logic edit, easy to miss since it's not near the `<script>` block.
3. **The role type is duplicated outside `demo-account.ts`, so widening `DemoRole` alone is not sufficient.** `AccountAuthForm.svelte` has two independent `role?: "admin" | "user"` literal unions (lines 42, 91) — neither imports `DemoRole` from `demo-account.ts`. The doc's touch list (§8) says "widen the role prop type on `enterSession()`" for this file, which is correct, but a plain grep for `DemoRole` (as this validation did) shows it's the *only* place the type is duplicated as a literal rather than imported — confirming the touch list is complete here, but flagging that any *future* new call site should import `DemoRole` instead of re-typing the union, or this same drift repeats.
4. **The scoped global CSS selector will need one line per new full-shell role, not zero.** Lines 165–169: `body:has([data-account-admin]:not([hidden])) #main-content { display: contents; }` exists specifically to strip marketing-layout padding assumptions for the admin app shell. If `AgentDesk` is also a full app-shell (sidebar/topbar, per §6's "reuse `AdminShell`'s outer chrome by literal duplication"), it needs the same selector added (`, body:has([data-account-agent]:not([hidden])) #main-content`) or `AgentDesk` will render with unwanted marketing padding around a sidebar layout. `GuestHub` — explicitly "lighter than a full shell" per §6 — likely doesn't need this, but that's a per-shell judgment call to make explicitly during build, not something that falls out automatically from copying the admin pattern.
5. **Minor:** `data-account-user` (the div/attribute name) doesn't semantically match `guest` — renaming the attribute (`data-account-guest`) touches both the Astro markup and the `<script>` querySelector, and is cheap to do now vs. leaving a `data-account-user` div that actually renders guest content, which reads as a bug to any future agent skimming the file.

None of this changes the recommendation — it's all still zero-dependency, client-side, same file. It's scope calibration for whoever builds it: `account.astro` is a ~30-line edit across markup + script + one style rule, not a couple of one-line branch additions.

## 5. Ladder verdict

**Agree with the ladder as written**, with the amendments above folded in (§3's capability-function addition, §3's `employeeSales()` fix, §4's account.astro scope note). Nothing found here argues for a new abstraction, a new file for the capability functions, or an early jump to a real IdP. The two gaps are both "the doc named the wrong existing function" or "the doc under-scoped one file," not "the doc's dependency/architecture call was wrong."

**Zero-new-deps: holds.** Confirmed against `package.json` (no adapter, no auth lib today) and `astro.config.ts` (no `output`/`adapter` override). Every fix in §3 and §4 above is implementable with functions and files already in the repo (`filterAdminRows`, `summarizeRows`, a role-string constant) — no new npm install, no new config key.

## 6. Suggested AFK build order

Ordered so each step is independently shippable/testable and later steps can't silently break earlier ones:

1. **`src/lib/demo-account.ts`** — widen `DemoRole` to `admin | agent | guest`, add `DEMO_AGENT`, extend `roleForEmail()`/the normalization ternary (map old `"user"` → `"guest"`), add the 5 capability functions from §3 (including `canAccessAdminShell`), add the seam `ponytail:` comment. Extend `demo-account.test.ts` in the same step (round-trip agent session, `"user"`-in-storage → reads back as `"guest"`).
2. **`functions/api/login.ts`** — add `isDemoAgent()` beside `isDemoAdmin()`; response `role` becomes `admin | agent | guest`. `register.ts` gets the comment-only touch (§8's "likely no functional change" is confirmed correct — no functional edit needed).
3. **`src/components/account/AccountAuthForm.svelte`** — import `DemoRole` instead of the two literal unions (closes §4.3); add "Continue as demo agent" button beside the existing admin one.
4. **`src/pages/account.astro`** — the real 4-way branch (closes §4.1/§4.2/§4.4/§4.5): rename `data-account-user` → `data-account-guest`, add `data-account-agent`, split the trailing `else`, rewrite the static copy, extend the `:has()` selector for any new full-shell role.
5. **`src/components/account/GuestHub.svelte`** (new, build before `AgentDesk` — it's the lighter shell, lower risk to get the pattern right first) — saved homes (local state, `client:visible`), inquiry history (static/demo), browse CTAs.
6. **`src/components/account/AgentDesk.svelte`** (new) — duplicate `AdminShell`'s chrome, wire the §3 pulse decision (recommend the "sample pulse, labeled as demo" option), inquiries panel (shared logic/markup with `AdminShell` where trivial, duplicated rather than extracted per the doc's rule-of-three reasoning), profile.
7. **Wire into `account.astro`** — swap in `AgentDesk`/`GuestHub` for their branches (was stubbed with placeholder markup in step 4; this step is the actual `client:load`/`client:visible` island mount).
8. **`docs/research/accounts-rbac-feature.md`** status line update, pointing at the now-built V-slice.

Steps 1–3 are pure logic/type changes with the existing test file as the check; steps 4–7 are the UI/branch work and should each get a quick manual click-through (`admin@osead.demo`, `agent@osead.demo`, any-other-email, signed-out) before moving to the next step, since there's no server enforcing correctness here — a broken branch fails silently as a blank div, not an error.
