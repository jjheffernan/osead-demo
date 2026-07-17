# TODO

Vertical slices for after-hours. One slice = one subagent. Prefer **commits on `main`** (no PR; avoid branch-merge HITL). Mark done with `[x]` when landed. Keep Astro for pages/layouts/SEO.

Vision SoT: `docs/VISION.md`  
Backlog seed: `docs/afk/backlog.md` · Plan: `docs/PLAN.md`

**Deploy gate:** Do **not** run the Cloudflare Pages deploy checklist until every open item in **Now** is `[x]`. Deploy lives under **Later** on purpose.

## Now

### Wave I — Accounts + RBAC (agent / guest)

Plan: `docs/research/accounts-rbac-v-slices.md`. Zero new deps; client-side `sessionStorage`/`localStorage` only; no `astro.config.ts`/`package.json`/env change. `DemoRole` grows to `admin | agent | guest` (old `user` → `guest`); three shells (AdminShell / AgentDesk / GuestHub); booking stays faux → `/contact` deep links. I·A = role foundation; I·B = guest; I·C = agent; I·D = janitor.

- [x] I1 Widen `DemoRole` + capability helpers: in `src/lib/demo-account.ts` set `DemoRole = admin|agent|guest`, add `DEMO_AGENT`, agent allowlist in `roleForEmail()` (from `demoStaff`/`DEMO_AGENT`), normalize stored `user`→`guest`, add `canEditContent`/`canViewAnalytics`/`canManageInquiries`/`canSaveHomes`/`canAccessAdminShell` + `ponytail:` seam; extend `src/__tests__/demo-account.test.ts` — acceptance: `pnpm build` + tests pass agent round-trip and `user`→`guest`; no `capabilities.ts` file, no mapping table
- [ ] I2 Role widening in Functions: `functions/api/login.ts` add `isDemoAgent()`, response `role` becomes `admin|agent|guest` (`guest` replaces `user`); `register.ts` comment-only seam — acceptance: `pnpm build` + agent creds return `{role:"agent"}`, other logins `{role:"guest"}`, admin unchanged; no hashing/store
- [ ] I3 AccountAuthForm import `DemoRole` + agent button: replace both literal `admin|user` unions in `src/components/account/AccountAuthForm.svelte` with imported `DemoRole`; add "Continue as demo agent" beside admin; refresh "plain user" copy — acceptance: `pnpm build` + agent button lands `/account` as agent; admin + fallback still work; no re-typed union
- [ ] I4 `account.astro` 4-way branch: rename `data-account-user`→`data-account-guest`, add `data-account-agent`, split trailing `else` into agent/guest, rewrite stale copy, extend `body:has()` selector for agent shell, gate via role/`canAccessAdminShell`; stub guest/agent panels — acceptance: `pnpm build` + all four states (signed-out/guest/agent/admin) render correct panel, no blank div
- [ ] I5 Guest local store: new `src/lib/guest-store.ts` — `toggleSavedListing`/`readSavedListings`/`isSaved` + `addInquiry`/`readInquiries` (`localStorage`, `{propertySlug,intent,checkIn?,checkOut?,submittedAt}`, status always submitted); new `src/__tests__/guest-store.test.ts` — acceptance: `pnpm build` + tests pass toggle + inquiry round-trip; no `status:"confirmed"`, no server call
- [ ] I6 GuestHub shell: new `src/components/account/GuestHub.svelte` (saved homes, inquiry history labeled "submitted", browse + message-agent CTAs) mounted `client:visible` in `account.astro` guest branch — acceptance: `pnpm build` + guest session renders saved/inquiry lists with clean empty states, CTAs navigate; no admin/agent panel, no fake checkout
- [ ] I7 Save toggle + inquiry mirror wiring: new `src/components/account/SaveHomeButton.svelte` on the PDP (`toggleSavedListing`/`isSaved`); hook `AvailabilityInquiry.svelte` success path to `addInquiry(...)` before the existing `/contact?intent=booking-inquiry` redirect — acceptance: `pnpm build` + PDP save persists across reload, availability submit adds a GuestHub inquiry row; no `externalBookingUrl` field, no Function change
- [ ] I8 Static agent assignment config: new `src/config/agent-assignments.ts` (inquiry fixtures → `demoStaff` id "assigned via market rotation" + agent→`market` map using existing `market` field) + selector helper defaulting to `demoStaff[0]`/`DEMO_AGENT` — acceptance: `pnpm build` + returns non-empty assigned list + market for demo agent; no `agentId` frontmatter, no routing UI, no `StaffMember.email`
- [ ] I9 AgentDesk shell: new `src/components/account/AgentDesk.svelte` (duplicate AdminShell chrome; Inbox from I8, market-scoped read-only inventory, Profile from `demoStaff`, "Sample assigned pulse (demo)" via sliced `employeeSales`; `canEditContent`/`canViewAnalytics` gate deep-links) mounted `client:load` in agent branch — acceptance: `pnpm build` + agent session shows inbox + market inventory + profile + labeled pulse, no content/analytics panel; no cloned AdminShell panels, no real money
- [ ] I10 Janitor + docs status: token/TS/style drift sweep across Wave I files (semantic tokens only, no dead `data-account-user`, no re-duplicated role literals, no new dep); update `docs/research/accounts-rbac-feature.md` status line to built — acceptance: clean tree, `pnpm build` + `pnpm lint` green, commit `chore(i): janitor after accounts + RBAC` or note PASS; no `AccountShell` extraction

### Wave F — Admin analytics one-stop shop

Plan: `docs/research/admin-analytics-v-slices.md`. Zero new deps (native SVG/CSS). Reuse `admin-analytics.ts` / `AdminAnalytics.svelte` / `AdminShell.svelte`. F1 = Analytics panel polish (one file, sequence to avoid conflicts); janitor between waves; F2 = one-stop shop + contract + docs.

- [x] F1 Sales trend sparkline: new `SalesSparkline.svelte` (`$derived` monthly group → inline `<svg><polyline>`, tokens only, no `client:*`) into `AdminAnalytics.svelte` — acceptance: `pnpm build` + sparkline renders in Analytics panel and reshapes on range/market filter change; no chart lib
- [x] F2 Employee leaderboard bars: CSS-only per-row `%`-width bar in `AdminAnalytics.svelte`'s existing `<table>` (sized vs top performer, same technique as occupancy bar) — acceptance: `pnpm build` + rows show proportional bars, top = full width; no `Table.astro` import
- [x] F3 Market split stat row: native 3-market tile row in `AdminAnalytics.svelte` (revenue + occupancy per market via `$derived`, same pattern as KPI grid) — acceptance: `pnpm build` + 3 market tiles render and update with filters; no pie/donut
- [x] F4 Loading state + source Badge: add `{#if status === "loading"}` shimmer (copy `Skeleton.astro` CSS, don't import) + optional `Badge.svelte` swap for source pill — acceptance: `pnpm build` + Refresh shows skeleton not instant zeroes; pill still reads Demo/External
- [x] F5 Overview KPI strip: independent `loadAdminAnalytics()` in `AdminShell.svelte` `panel === "overview"` branch, 3-KPI subset beside inventory tiles (second-fetch, no state lift) — acceptance: `pnpm build` + Overview shows 3 live KPIs matching Analytics YTD; no 5th nav
- [x] F6 Outbound JSON endpoint: `functions/api/admin-analytics.json.ts` returning `buildDemoAdminAnalytics()` as JSON (wraps existing fn, no new logic) — acceptance: `pnpm build` + endpoint returns valid `{source,generatedAt,currency,rows[]}`; pointing `PUBLIC_ADMIN_ANALYTICS_URL` at it shows "External feed"; no auth infra/KV/D1
- [x] F7 Adapter worked-example docs: `docs/specs/admin-analytics-adapters.md` mapping one PriceLabs `listing_metrics` JSON + one Hostaway `listingFinancials` CSV → `AdminAnalyticsRow` (doc-only, carry maturity caveats; market/employee are OSEAD-side joins) — acceptance: `pnpm build` + ≥2 vendor→row mappings + note which fields no rental vendor fills; no live client, no comps/AVM
- [x] F8 Metabase embed stub (optional): bring-your-own `PUBLIC_ADMIN_REPORT_EMBED_URL` Reports sub-section **inside** Analytics panel (iframe if set, documented placeholder if not; inert by default) — acceptance: `pnpm build` + env-unset shows placeholder, no network/CSP error, demo works offline; no `_headers` change

### Wave G — Phase 3 one-stop polish (broker conversion bar)

Plan addendum: `docs/research/admin-analytics-v-slices.md` § Phase 3. Densify Overview into a true one-stop shop (screenshot density); audit client JS; keep Astro→Svelte→thin TS. Zero new chart deps. Still no 5th nav.

- [x] G1 Overview densify: in `AdminShell.svelte` Overview, add closed-deals + top-market line under the KPI strip and tighten action row spacing so first viewport feels broker-useful (not empty below buttons) — acceptance: `pnpm build` + Overview shows KPIs + closed deals + leading market without scrolling past fold on desktop; no Card.svelte swap yet
- [x] G2 Overview staff pulse: compact top-3 employee sales list on Overview (reuse `employeeSales` from demo payload already loaded for G1/F5; no second fetch if G1 already has rows) — acceptance: `pnpm build` + Overview shows 3 staff names with sales $; link/jump to `#analytics`; no new deps
- [x] G3 Client JS budget note: short doc `docs/afk/admin-js-budget.md` listing which admin islands use `client:load` vs SSR-safe, and confirm no unused chart/React kits landed — acceptance: `pnpm build` + doc exists; grep confirms zero chart.js/uplot/react admin imports
- [x] G4 CollectionPage JSON-LD: add CollectionPage (or ItemList) JSON-LD on `/collections/[slug]` — acceptance: `pnpm build` + JSON-LD present in page source for one collection
- [x] G5 Janitor: style/token/TS drift pass across Wave G files; `pnpm build` + `pnpm lint` green; no new deps — acceptance: clean tree commit `chore(g): janitor after one-stop polish` or note PASS with no commit

### Wave H — Deploy gate (Now clear)

Now is clear after Wave G. Run the Cloudflare Pages deploy checklist as a documented ops pass — do **not** require live production secrets if absent; record SKIP with reason.

- [x] H1 Cloudflare Pages deploy checklist: walk Starlight `/docs/deployment/cloudflare-pages/` + `docs/TEMPLATE.md` deploy steps; write `docs/afk/deploy-checklist-pass.md` with PASS/SKIP per step; `pnpm build` green — acceptance: checklist artifact committed; no force-push; do not set production secrets in repo

### Wave E — TS placement + conversion UX + media + testimonials

- [x] S24 TS placement: move what can into Astro frontmatter or Svelte modules; **keep** Astro pages/layouts/SEO/Img/Icon; do not delete Astro UI just to chase language % — acceptance: `pnpm build` + short note in `docs/afk/ts-placement.md` of must-keep vs moved
- [x] S25 Conversion UX research+plan: high-conversion RE sites → audit frontend practices → plan for Astro+Svelte in `docs/research/conversion-ux.md` — acceptance: ≥5 exemplars, practice list, prioritized implement plan
- [x] S26 Conversion UX build: implement top plan items from S25 (homepage/PDP/listings density & trust) — acceptance: `pnpm build`, visible UX changes, no new CMS/DB
- [x] S27 Conversion improvement audit: post-build pass; list residual surface in `docs/afk/conversion-audit.md`; fix trivial wins only — acceptance: audit doc + `pnpm build`
- [x] S28 Testimonials: Svelte component for ratings of listings, staff, and business/office; seed demo content; submit path via existing contact Function or static seed — acceptance: wired on about + ≥1 PDP + home or footer; `pnpm build`
- [x] S29 Beachfront media research+plan: impressive beachfront sites → stay-on-page techniques → implement plan in `docs/research/beachfront-media.md` — acceptance: ≥5 sites, technique list, prioritized plan
- [x] S30 Media build: implement S29 plan (hero/media presence; license-safe or clearly marked demo assets) — acceptance: `pnpm build`, richer media on home/markets/PDP without breaking LCP badly

### Wave 0 — Complete (do not re-open)

- [x] V1 Delete starter SaaS pages/nav/copy; OSEAD IA only
- [x] V2 Fair Housing + demo disclaimers
- [x] V3 ListingFilters Svelte island
- [x] V4 PropertyGallery Svelte island (+ video media support)
- [x] V5 Faux booking + check availability → contact
- [x] V6 Coastal weathered-wood design + brand-first homepage
- [x] V7 Expand seed inventory (≥12 homes)
- [x] V8 Contact/inquiry Function polish (rent/sale/booking intents)
- [x] V9 SEO collections (oceanfront, pets, large groups, elevators)
- [x] V10 Remove leftover starter surfaces + stabilize unit tests
- [x] V10b Daytime UX densify: O-sea-D brand, partner links, staff/about, distinct rent/sale inventory, footer dedupe

### Wave A leftovers — Listing UX

- [x] V11 Related properties on PDPs (3 same market or waterfront; no drafts) — backlog A3
- [x] V12 Wire Breadcrumbs on market + property pages (Home → … trail; optional BreadcrumbList JSON-LD) — backlog A4

### Wave B leftovers — SEO destinations

- [x] V13 Town pages under markets (`/markets/{market}/{town}` or flat `/towns/{town}`; SEO only, not primary nav) — backlog B2
- [x] V14 Three SEO journal posts (OBX oceanfront week; LBI buying; Delaware bayfront vs oceanfront) with internal links to markets/collections + ≥1 property each — backlog B3
- [x] V15 Programmatic sitemap priorities for PDPs, markets, collections, and towns — docs/PLAN.md Phase 2

### Wave C leftovers — Conversion

- [x] V16 Contact thank-you + honeypot (bot field ignored; success state; no new backend services) — backlog C2
- [x] V17 Inquiry rate-limit hardening in Pages Function (lightweight; document behavior) — docs/PLAN.md Phase 3

### Wave D leftovers — Template & media polish

- [x] V18 Replace SVG listing placeholders with license-safe coastal photo set (or clearly marked demo media) + meaningful alts — docs/PLAN.md Phase 1
- [x] V19 Market page full-bleed photography pass — docs/PLAN.md Phase 4
- [x] V20 Starlight docs: “White-label this template” section aligned with `docs/TEMPLATE.md` — docs/PLAN.md Phase 4
- [x] V21 TEMPLATE.md walkthrough test on throwaway config; document gaps in `docs/TEMPLATE.md` or `docs/afk/` — backlog D3

### Hygiene (before deploy)

- [x] V22 Lint debt: clear `pnpm lint` blockers (stylelint / `astro check` / remaining Analytics noise) so DoD gate is green — docs/PLAN.md Definition of done
- [x] V23 Playwright: install Chromium + bring e2e smoke suite green (or document skip with reason) — V10 leftover

## Next

- **Wave I — Accounts + RBAC** (start at **I1**, run I1→I10 in order; foundation before guest before agent). Clear all Wave I items before promoting from Later.

## Later

- [ ] Optional email delivery (Resend / Mailchannels) **only if secrets present** — docs/PLAN.md Phase 3

## Explicit non-goals (unless requested)

- Full calendar booking + payments
- Live IDX/MLS sync
- Multi-tenant SaaS admin
- Native mobile apps

## Blocked

- (none)
