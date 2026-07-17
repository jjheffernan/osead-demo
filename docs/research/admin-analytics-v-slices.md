# Admin analytics — Phase 1 synthesis → Phase 2 V-slice build plan

Final synthesizer output for the admin-analytics feature push (see `docs/research/admin-analytics-feature.md`). Inputs: `re-analytics-platforms.md`, `admin-dashboard-presentation.md`, `admin-analytics-validation-platforms.md`, `admin-analytics-validation-presentation.md`, plus the live code (`src/lib/admin-analytics.ts`, `AdminShell.svelte`, `AdminAnalytics.svelte`).

**One-line goal:** turn the existing Analytics panel + Overview into a denser broker/manager one-stop shop, publish the outbound JSON contract, and document the plug-in path — **zero new dependencies**, first-party demo data, offline-safe.

## Locked decisions (do not relitigate in Phase 2)

- `AdminAnalyticsPayload` is the contract. Demo seed (`buildDemoAdminAnalytics`) stays. No data-model changes.
- Zero new chart deps by default. Native SVG/CSS only. `uPlot` is **out of scope** for this push (Phase 3+, only if a ticket asks for multi-series zoom/pan).
- **Never import `.astro` components into `.svelte` islands** (verified impossible). Copy the CSS *pattern* from `Table.astro`/`Skeleton.astro`/`Badge.svelte` where visual parity is wanted; `Badge.svelte`/`Card.svelte` are real Svelte and *importable* but see per-slice notes.
- Nested islands **cannot** use `client:visible`. `AdminShell` mounts once with `client:load`; everything under it hydrates as one unit. Panel `{#if}` already gates construction — no directive needed, none available.
- Admin IA stays **Overview / Analytics / Content / Site tools**. Densify existing panels; **do not invent a fifth primary nav**. Any "Reports"/embed slot lives *inside* the Analytics panel.
- Vendor APIs (PriceLabs/Hostaway/Beyond/etc.) are **adapter docs**, not code. Demo must render fully offline from the seed.
- No new seed data needed: the seed already emits 12 months × 3 markets × N staff with `salesVolume`, `rentalRevenue`, `occupied/availableNights`, `closedDeals`. Every widget below is a new *consumer* of `filtered`/`totals`/`byEmployee`, not a new data source.

## Build waves

Ordered cheapest/lowest-risk first. **Wave F1** is self-contained inside `AdminAnalytics.svelte` (one file, sequential to avoid same-file conflicts). **Wave F2** touches new files + `AdminShell.svelte`. Run the janitor between waves for stall / token-style / TS-bloat drift.

| Wave | Slices | Theme | Blast radius |
| --- | --- | --- | --- |
| **F1** | A1–A4 | Analytics panel polish (zero-dep visuals) | `AdminAnalytics.svelte` (+1 tiny new component) |
| **F2** | A5–A8 | One-stop shop + outbound contract + plug-in docs | `AdminShell.svelte`, `functions/`, `docs/` |
| **(none)** | A9 | Explicitly deferred (uPlot) — do not schedule | — |

---

## Wave F1 — Analytics panel polish

### A1 — Sales trend sparkline
- **Goal:** add a monthly sales/rental trend sparkline to the Analytics panel — the one rung-2 visual the file doesn't already have.
- **Primary files:** `src/components/account/SalesSparkline.svelte` (new), `src/components/account/AdminAnalytics.svelte`.
- **How:** pure `$derived` grouping of `filtered` by `period` month → single inline `<svg><polyline>`; token vars only (`var(--foreground)`, `var(--muted-foreground)`). SSR-safe markup, no `client:*`. Pair with an `aria-label`/offscreen number so it's not chart-only.
- **Acceptance:** `pnpm build` green; in the Analytics panel a sparkline renders and its shape changes when the Time range / Market filter changes.
- **Deps:** none.
- **Do not:** add a charting lib; add axes/tooltips/zoom (that's the uPlot rung); import `.astro`.

### A2 — Employee leaderboard bars
- **Goal:** make the existing 8-row employee `<table>` scannable with a per-row sales bar.
- **Primary files:** `src/components/account/AdminAnalytics.svelte` (only).
- **How:** CSS-only — add a `%`-width bar per row sized against the top performer's `salesVolume`, same technique as `.admin-analytics__occupancy-fill`. No new component, no new query (reuse `byEmployee`).
- **Acceptance:** `pnpm build` green; leaderboard rows show proportional bars; top performer's bar is full-width.
- **Deps:** none (independent of A1; sequence after A1 only because both edit this file).
- **Do not:** swap to `Table.astro` (unreachable from Svelte); add sorting/pagination/TanStack.

### A3 — Market split stat row
- **Goal:** a 3-market breakdown (rental revenue + occupancy per market) so "which market is carrying us" is one glance.
- **Primary files:** `src/components/account/AdminAnalytics.svelte` (only).
- **How:** native 3-tile stat row, same markup pattern as the existing `.admin-analytics__kpi` grid; aggregate `filtered` by `market` in a `$derived`. No chart (3 values is a poor chart fit).
- **Acceptance:** `pnpm build` green; three market tiles render and update with the Season/Employee filters; hidden/zeroed cleanly when a single market is filtered.
- **Deps:** none.
- **Do not:** build a pie/donut; add a 4th synthetic market.

### A4 — Loading state + source Badge
- **Goal:** close the missing `status === "loading"` branch and tidy the source pill.
- **Primary files:** `src/components/account/AdminAnalytics.svelte` (+ optional `Badge.svelte` import).
- **How:** add `{#if status === "loading"}` with 2–3 hand-rolled shimmer `<div>`s (copy `Skeleton.astro`'s CSS, don't import it). Optionally swap the `.admin-analytics__source span` for the importable `Badge.svelte` — mechanical, low-risk.
- **Acceptance:** `pnpm build` green; clicking **Refresh** shows a skeleton (not instant zeroes) before data returns; "Demo seed" / "External feed" pill still reads correctly.
- **Deps:** none.
- **Do not:** import `Skeleton.astro`; add a spinner lib.

**Janitor checkpoint after F1:** confirm `pnpm build` + `pnpm lint` (incl. `check:kpis`) still green; no hardcoded hex / Tailwind palette colors crept in; no new `package.json` entries; `AdminAnalytics.svelte` didn't balloon (extract only if a widget is reused elsewhere — it isn't yet, so inline is fine).

---

## Wave F2 — One-stop shop + contract + plug-in docs

### A5 — Overview KPI strip
- **Goal:** the "denser Overview one-stop shop" — show sales volume / occupancy / rental revenue next to the existing inventory tiles on login, without leaving Overview.
- **Primary files:** `src/components/account/AdminShell.svelte` (only).
- **How:** an independent `loadAdminAnalytics()` call from the `panel === "overview"` branch, rendering a condensed 3-KPI subset (reuse `summarizeRows`). Prefer the **second-fetch** approach over lifting shared state — the seed is synchronous and tiny, no prop drilling, no hydration restructuring. Reuse the `.admin-panel__stats` visual pattern already in the shell.
- **Acceptance:** `pnpm build` green; on load the Overview panel shows 3 live KPI numbers alongside the inventory counts; numbers match the Analytics panel's YTD default.
- **Deps:** conceptually independent; sequence after F1 so the Analytics visuals it mirrors are settled.
- **Do not:** lift `filters`/`payload` into `AdminShell` (only if a later ticket asks for filter-sync between panels); add a 5th nav item; block Overview render on the fetch (show inventory immediately, KPIs when ready).

### A6 — Outbound JSON endpoint (white-label contract)
- **Goal:** publish `AdminAnalyticsPayload` at a real URL so a broker's BI/warehouse can poll it — proves the outbound contract with code that already exists.
- **Primary files:** `functions/api/admin-analytics.json.ts` (new; Cloudflare Pages Function), + one line in `docs/` noting the `PUBLIC_ADMIN_ANALYTICS_URL` round-trip.
- **How:** call `buildDemoAdminAnalytics()`, return it as `application/json`. Zero new logic — wraps the existing exported function. Note (don't require) that a real deploy gates it behind a bearer token.
- **Acceptance:** `pnpm build` green; `curl`/fetch of the function path returns valid `{ source, generatedAt, currency, rows[] }`; pointing `PUBLIC_ADMIN_ANALYTICS_URL` at it makes the panel show "External feed".
- **Deps:** none.
- **Do not:** add auth infra, KV/D1, a webhook receiver, or per-vendor reshaping here (that's Phase 3+ / docs-only).

### A7 — Adapter worked-example docs
- **Goal:** close the documentation gap — a copy-pasteable "vendor payload → `AdminAnalyticsRow`" reference so a future integrator doesn't re-derive the mapping.
- **Primary files:** `docs/specs/admin-analytics-adapters.md` (new) + optional committed `.json` fixture(s).
- **How:** doc-only, no vendor keys. Show one PriceLabs `get_listing_performance_metrics` JSON → row (needs DFD→`YYYY-MM-01` remap; `salesVolume`/`closedDeals`/`employeeId` stay 0 — rental-only tool) and one Hostaway `finance/report/listingFinancials` CSV row → row. Carry the validation caveats: PriceLabs endpoint is new (2026-06) + $1/mo/listing + email-to-enable; Beyond MCP is beta/waitlisted; market + employee fields are always OSEAD-side joins.
- **Acceptance:** `pnpm build` green (doc doesn't break build); doc contains ≥2 worked vendor→row mappings and states which fields no rental vendor can fill.
- **Deps:** none.
- **Do not:** write a live OAuth/PAT client; wire a real vendor call; add comps/AVM (ATTOM/HouseCanary/Trestle/Reonomy) — explicitly out of scope.

### A8 — Metabase guest-embed Reports stub (optional)
- **Goal:** a bring-your-own-URL embed slot for brokers who already run Metabase/Looker — near-zero code, no vendor account to ship the *slot*.
- **Primary files:** `src/components/account/AdminAnalytics.svelte` (a collapsed "Reports" sub-section **inside** the Analytics panel).
- **How:** read an optional `PUBLIC_ADMIN_REPORT_EMBED_URL`; if set, render an `<iframe>`, else render a documented placeholder card explaining the bring-your-own path. Ships inert by default (no CSP change, no external call).
- **Acceptance:** `pnpm build` green; with the env unset the Analytics panel shows a documented placeholder (no network call, no CSP error); the demo still works fully offline.
- **Deps:** sequence after A5/A4 (shares the Analytics panel surface).
- **Do not:** add `frame-src` to `public/_headers` (that's a Phase 3 decision when a real URL is wired); make the embed the default rendering path; embed anything with real per-agent numbers behind a public link.

---

## A9 — Deferred (do NOT schedule into this push)

- **uPlot trend chart.** No current data shape (12×3×N, filter-driven, non-streaming) justifies rung 3. Revisit only when a ticket explicitly asks for sub-day granularity, many toggleable series, or real zoom/pan. If ever built: thin Svelte island, dynamic `import("uplot")`, hand-rolled `IntersectionObserver` (no `client:visible`), sparkline/table as the SSR fallback.

## Explicit out-of-scope for this feature push

- Any new npm dependency (charts, table libs, React kits, `jsdom`/`linkedom`).
- `Card.svelte` KPI-tile swap (hairline grid → boxed cards) — a deliberate visual-language decision, hold for Phase 3.
- `Tabs.svelte` panel-switcher swap — current hand-rolled nav already does hash-sync + mobile drawer; swapping is *more* code.
- Live vendor OAuth/PAT clients; KV/D1 webhook receiver; CSP loosening for real BI embeds.
- Comps/AVM/market-data integrations (ATTOM, HouseCanary, Cotality/Trestle, Reonomy, Bridge/Zillow).
- Multi-tenant admin, calendar booking/payments, live IDX/MLS (repo non-goals).

## Definition of done

**Phase 2 (after-hours, per slice):** `pnpm build` green + the slice's concrete UI/API check passes; committed on `main` (no PR, no HITL); zero new `package.json` entries; `pnpm lint`/`check:kpis` still green (semantic tokens only); demo renders fully offline from the seed. Each slice is independently shippable in ~one tick.

**Phase 3 (human-led):** merge any drift into one cohesive AdminShell composition matching the screenshot density bar; make the deferred design calls (Card vs hairline, optional uPlot); wire a real Metabase/embed URL + the matching CSP change if wanted; audit unused client JS; run the Cloudflare Pages deploy checklist. Conversion bar: a broker should want this view enough to white-label the template.
