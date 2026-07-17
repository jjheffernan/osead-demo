# Research: analytics *presentation* for the admin dashboard

Companion to [`admin-analytics-feature.md`](./admin-analytics-feature.md) (Phase 1 artifact: "Presentation / chart stack"). Scope is **how to draw** what `src/lib/admin-analytics.ts` already computes — not the data contract, not new backend platforms (`re-analytics-platforms.md` covers that). Stack constraints: Astro 7, Svelte 5 islands (SSR-default), TypeScript glue, Cloudflare Pages (+ optional Functions), semantic design tokens, ponytail.

## TL;DR recommendation

**Ship first-party HTML/CSS/SVG, upgrade to `uPlot` only if a chart needs true line/area time-series with zoom/tooltips.** Nothing else on the comparison list earns its bundle cost for OSEAD's current data shape (12 rows × 3 markets × N staff, refreshed on filter change, not streaming). `AdminAnalytics.svelte` already proves this: a CSS occupancy bar + `<table>` is more legible than a chart would be for 5 KPIs and an 8-row leaderboard.

## Recommendation ladder (ponytail)

Climb one rung at a time; stop at the first rung that satisfies the ticket.

1. **Don't chart it.** KPI numerals + `<table>` (current `AdminAnalytics.svelte` pattern) beat a chart for "what's the number," which is most of what a broker needs on login. Only reach for a chart when the *shape over time/category* is the point, not the value itself.
2. **Native SVG/CSS.** Sparkline = one `<svg><polyline>`, computed from `rows` in the component's `$derived`. Bar/donut = `<div>` widths or `conic-gradient()`. Zero dependencies, perfect SSR, trivially themed with existing tokens (`var(--foreground)`, `var(--muted)`, etc.), and it's what `.admin-analytics__occupancy` already does.
3. **`uPlot` for real time-series.** If a future slice needs 12-month sales/occupancy trend lines with hover tooltips and per-employee series toggling, uPlot (~50 KB min, 0 deps, canvas) is the smallest thing that does that job properly. Wrap it in one thin Svelte island (`onMount` + `new uPlot(...)`, `client:visible`).
4. **`LayerChart`/`LayerCake` only if the design calls for bespoke multi-layer Svelte-native charts** (e.g., an oceanfront-inventory map overlay, or SVG+canvas hybrid) where hand-rolled SVG would balloon in complexity. This is a real Svelte 5 dependency, not a wrapper around a vanilla-JS lib — heavier to learn, still reasonable to bundle.
5. **Never:** Chart.js/ECharts/Plotly-class libraries, React dashboard kits, BI iframe embeds as the *default* path. These solve problems OSEAD's admin demo doesn't have (huge datasets, cross-framework reuse, third-party BI ops team). See "What NOT to add."

## Comparison table

| Library | Type | Min+gzip (realistic) | Svelte fit | SSR | A11y | Theming | Maintenance verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Native SVG/CSS** (sparkline, bar, conic-gradient) | Hand-rolled | **0 KB** | N/A — it's markup | Perfect (pure HTML/SVG) | Full control (`role`, `aria-label`, `<title>`) | Direct token vars | You own it; ~20-40 lines per chart type |
| [uPlot](https://github.com/leeoniya/uPlot) | Canvas, 0 deps | ~50 KB (whole lib; no tree-shaking needed, it's already tiny) | Vanilla JS; wrap in a Svelte island | Render client-only (canvas can't SSR); ship a static placeholder/skeleton for SSR | Canvas = no DOM for screen readers; must pair with an offscreen data table (already have `<table>` pattern) | CSS vars work for its few themeable knobs; series colors set in JS from token values read at runtime | Tiny, stable API, single maintainer but very low churn; best perf/KB ratio of any charting lib |
| [Apache ECharts](https://echarts.apache.org/) (`echarts/core` tree-shaken) | Canvas/SVG | ~100 KB gz tree-shaken modular import (**~520 KB gz if you import the default `echarts` barrel** — easy trap) | Vanilla JS; needs a wrapper island; no first-party Svelte bindings | SVG-string SSR mode exists (5.3+) + 1 KB gz client "lite runtime" (5.5+), but wiring it is nontrivial for a demo | Canvas mode = same a11y gap as uPlot; SVG mode is more inspectable | Full theming API, but another abstraction layer on top of tokens | Powerful, actively maintained (Alibaba/Apache) — overkill for 5 KPIs and a leaderboard |
| [Chart.js](https://www.chartjs.org/) (+ `svelte5-chartjs` or `svelte-chartjs`) | Canvas | ~60-90 KB gz tree-shaken (per-chart-type registration); `chart.js/auto` pulls everything (~200+ KB) | Community Svelte 5 wrapper exists ([`svelte5-chartjs`](https://github.com/LupusAI/svelte5-chartjs)) — third-party, not core team | Canvas, client-only, same as uPlot | Canvas gap; Chart.js ships some ARIA fallback text config | CSS-var friendly via JS-read colors | Mature, huge ecosystem, but heavier than uPlot for the same line/bar job and the Svelte wrapper is a second dependency to track |
| [Billboard.js](https://naver.github.io/billboard.js/) | SVG/Canvas, D3-based | ~90 KB gz minimal (`bar` only, v4 opt-in modules) + **D3 as peer dep** | Vanilla JS; no Svelte wrapper | SVG mode is DOM-based, so partial SSR is more plausible than canvas libs, but not first-class | SVG mode is more accessible than canvas | Good SVG/CSS theming | Well-maintained (Naver), but pulling in D3 as a peer just for chart rendering is a bigger dependency footprint than the payoff for OSEAD's data volume |
| [Observable Plot](https://observablehq.com/plot/) | SVG, D3-based | ~templated via ESM, tree-shakes reasonably; still D3-adjacent | Vanilla; returns a detached DOM node, needs `{@html}` or manual `append` in an `onMount` | **Can** SSR by feeding it a `jsdom`/`linkedom` document server-side and serializing `outerHTML` — real option on a Cloudflare Pages Function, but adds `jsdom`/`linkedom` as a build/runtime dependency | SVG output is DOM-inspectable, decent | CSS-targetable SVG, but Plot's own color/style grammar fights token-based theming somewhat | Great for exploratory/analytical one-off charts; awkward fit for a small set of *recurring* dashboard widgets that get re-rendered on every filter change |
| [LayerChart](https://next.layerchart.com/) (v2, Svelte 5 native) | SVG/Canvas, D3-based | ~50-80 KB gz `core` scenarios per the v2 bundle-size guide (varies a lot by which layers you import) | **Best native Svelte 5 fit** — runes, snippets, `ssr` prop on `<Chart>` | First-class: `<Chart ssr>` renders server-side | Improving, still SVG/DOM based so more tractable than canvas-only libs | Ships own default styles (Tailwind no longer required in v2) — needs care to map onto OSEAD's *semantic tokens* instead of its defaults | Active, fast-moving (still `next`/v2 churn), real dependency tree (`d3-*`, `@layerstack/*`) — appropriate only if bespoke charts are actually needed |
| [LayerCake](https://layercake.graphics/) | Headless SVG/Canvas/HTML/WebGL layout, Svelte-native | Small core (no built-in chart primitives to ship — you write/copy the layer components) | Native Svelte 5 (`svelte: >=5` peer as of the runes rewrite) | Designed for SSR-first responsive charts (docs explicitly call this out) | You build a11y in per layer, same as native SVG | You write the components, so tokens map 1:1 | Low-dependency, "bring your own layers" — closest thing to "ponytail chart lib" if hand-rolled SVG ever gets too repetitive across many chart types |
| Looker Studio / Metabase / Grafana **embeds** | External BI, iframe | 0 KB JS (it's an iframe) | N/A | N/A — SSR of the *page* is fine, the widget itself is always client-rendered by the BI vendor | Depends entirely on vendor; generally poor (nested iframe, vendor's own a11y) | None — you get the vendor's chrome, not OSEAD's tokens | See dedicated section below — real ops cost, wrong fit for a template/demo |

## Bundle & SSR notes

- **Canvas-based libs (uPlot, Chart.js, ECharts-canvas) cannot render meaningfully during Astro's SSR pass.** The server has no `<canvas>` context. Practical pattern: SSR a skeleton/placeholder (or the underlying data as a plain `<table>` for a11y + no-JS fallback), then hydrate the canvas as a `client:visible` Svelte island. This matches AGENTS.md's "Svelte 5 islands... `client:*` only when needed."
- **SVG-based libs (LayerChart, LayerCake, Observable Plot, Billboard.js SVG mode, native hand-rolled SVG) can SSR real markup**, which is strictly better for the demo's "works without JS, degrades gracefully" story and for Cloudflare Pages' static-first model.
- **ECharts' tree-shaking trap is real and easy to hit by accident**: `import * as echarts from 'echarts'` ships the ~520 KB gz default bundle; only the modular `echarts/core` + `echarts.use([...])` path gets to ~100 KB gz. If ECharts is ever adopted, this must be enforced (e.g. an ESLint rule or a comment) or a routine `pnpm build` will silently regress the JS budget `check:kpis`/lint likely tracks.
- **uPlot has zero dependencies and the smallest true footprint (~50 KB) of any full charting library** — if OSEAD ever needs canvas-grade time-series performance (e.g., a "12-month occupancy" line chart with many series), this is the correct next step, not Chart.js or ECharts.
- **LayerChart v2 requires Svelte 5** (matches OSEAD exactly) but is still versioned as `next`/pre-1.0 with the docs domain itself in flux (`next.layerchart.com`) — treat as "promising, not yet boring," per the ponytail preference for mature deps.
- **No dependency here has an official Astro integration need** — all are plain npm packages consumed from inside a `.svelte` file; Astro's job is just deciding `client:` hydration directive, same as any other island.

## Headless table / KPI patterns (reuse what exists)

`src/components/ui/` already has the primitives a dashboard needs — no new UI kit required:

- `data-display/Table/Table.astro` — reuse instead of the raw `<table>` in `AdminAnalytics.svelte` for consistent styling with the rest of the site.
- `data-display/Card/Card.svelte` — right container for each KPI tile (`admin-analytics__kpi` today is bespoke markup that could become `Card` instances).
- `data-display/Skeleton/Skeleton.astro` — loading state for the `status === "loading"` branch, and for any client-only canvas island's SSR placeholder.
- `data-display/Badge/Badge.svelte` — the "Demo seed" / "External feed" source pill already resembles a Badge use case.
- `navigation/Tabs/Tabs.svelte` — could back `AdminShell`'s panel switcher (`overview`/`analytics`/`content`/`site`) instead of hand-rolled buttons, if that ever needs richer state (URL-synced tabs already partially exists via `history.replaceState`).
- `form/Field` + `form/Select` — already used for the filter row; no change needed.

This is the ponytail path for "table/KPI patterns": **the shadcn-like kit under `ui/` already covers structure; only the sparkline/bar visuals are missing**, and those are the native-SVG rung above, not a new headless-table library (e.g. TanStack Table would be pure over-engineering for 4 filter dropdowns and an 8-row array).

## Embed approaches for external BI (Looker Studio / Metabase / Grafana)

All three work *technically* on Cloudflare Pages, but all three are the wrong default for OSEAD:

| Platform | How it embeds | CSP change needed | Real-world catch |
| --- | --- | --- | --- |
| **Looker Studio** | `<iframe src="https://lookerstudio.google.com/embed/...">`, report set to "Anyone with the link" for a public/unauthenticated demo | Add `frame-src https://lookerstudio.google.com;` to `public/_headers`' CSP (currently scoped to `'self' https://www.google.com https://maps.google.com`) | Public embed = **publicly readable data**, no per-broker scoping; requires a real Google account + report built and maintained outside this repo |
| **Metabase** | Public link iframe (no auth) or JWT-signed static embed (paid tiers for real auth) | `frame-src` addition, same as above; **and** if OSEAD's own response headers ever add `Cross-Origin-Embedder-Policy`, Metabase's responses lack the matching `Cross-Origin-Resource-Policy: cross-origin` header (self-host workaround via reverse proxy; not fixable on Metabase Cloud) | Needs a hosted Metabase instance (self-host or Cloud) — real infra, exactly what AGENTS.md's "keep backend light: no CMS/DB/booking engine unless a ticket explicitly asks" is warning against |
| **Grafana** | Public dashboard (Enterprise/OSS only, not Cloud) or `allow_embedding=true` + anonymous-viewer config for internal use | `frame-src` addition | Anonymous access mode means **no access control at all** for anyone who finds the iframe URL; public dashboards aren't available on Grafana Cloud |

**Verdict:** BI iframes are a legitimate *integration point* for a real brokerage that already runs Looker/Metabase/Grafana internally — worth documenting as an option in `re-analytics-platforms.md`-style guidance — but they are not the OSEAD template's presentation layer. They require external infra the template shouldn't assume, weaken the CSP (`frame-src 'self'` → third-party domains), and hand over OSEAD's design system to the BI vendor's chrome. If ever wired in, gate it behind the same `PUBLIC_ADMIN_ANALYTICS_URL`-style env plug so the default demo ships with zero external calls.

## First-party-only path — when it's enough

It's enough for essentially everything the current `admin-analytics.ts` shape produces:

- **KPI numerals** (`salesVolume`, `occupancyRate`, `rentalRevenue`) → already just `<strong>{formatUsd(...)}</strong>`. No chart needed, ever.
- **Occupancy** → already a CSS width bar (`admin-analytics__occupancy-fill`). This *is* the right widget for "one ratio, one glance."
- **Sales trend across the 12 monthly `period` buckets** → an inline SVG sparkline is enough: one `<polyline>` computed from `rows` grouped by month, no axes, no interactivity, styled with `var(--foreground)`/`var(--muted-foreground)`. This is the natural next widget for the "denser Overview" goal in `admin-analytics-feature.md` and needs no new dependency.
- **Per-employee comparison (`employeeSales`)** → horizontal `<div>` bars sized by `%` of the top performer, inside the existing `<table>` rows or as a compact leaderboard card — same technique as the occupancy bar, just per-row.
- **Market breakdown (3 markets)** → 3-value comparison is a poor fit for any chart type; a small 3-column stat row or 3 CSS bars covers it completely.

The only OSEAD dashboard need that *isn't* comfortably native SVG is a genuine multi-series time-series with hover/zoom — and that's rung 3 (uPlot), not rung 2.

## Fit with existing `AdminShell` / `AdminAnalytics`

- `AdminShell.svelte` already isolates the analytics panel behind `{#if panel === "analytics"}` — any new chart component slots in exactly where `<AdminAnalytics />` sits today; no shell changes needed for presentation work.
- `AdminAnalytics.svelte` already does the hard part: `$derived` filtering (`filterAdminRows`), summarization (`summarizeRows`), and per-employee rollup (`employeeSales`) live in `admin-analytics.ts`, framework-agnostic. Any chart is just another consumer of `filtered`/`totals`/`byEmployee` — **no data-layer changes required**, confirming this ticket's "presentation only" scope.
- The component is a single Svelte island already (loaded via `onMount` → `loadAdminAnalytics()`); adding a canvas-based sub-chart means nesting one more small island *inside* it (or lazy-mounting a chart only once `status === "ready"`), not restructuring hydration boundaries.
- All current visuals (KPI tiles, occupancy bar, table) use plain CSS + design tokens (`var(--border)`, `var(--muted-foreground)`, `var(--text-xs)`, etc.) — any new sparkline/bar widget should follow the same `<style>`-block-per-component convention rather than introducing a chart library's own theme object.
- `formatUsd`/`formatPct` already centralize number formatting — new chart tooltips/labels should call these, not re-implement `Intl.NumberFormat`.

## Proposed presentation architecture — "one-stop shop" broker dashboard

Layered so each rung of the ladder above maps to one slice of the UI, buildable independently (fits the AFK vertical-slice model in `admin-analytics-feature.md`):

```
AdminShell.svelte  (existing — panel switcher, no changes needed)
└─ AdminAnalytics.svelte  (existing — filters + data hydration, no changes needed)
   ├─ KPI row            → Card.svelte × N          (existing ui/, restyle only)
   ├─ Occupancy ratio     → CSS bar                  (existing, unchanged)
   ├─ Sales trend         → new: SalesSparkline.svelte   (native inline SVG, SSR-safe, no client:* needed — pure derived markup)
   ├─ Employee leaderboard→ Table.astro + inline CSS bars per row (swap raw <table> for ui/Table, add %-width bar per row)
   └─ Market split        → 3-stat row or 3 CSS bars (native, no new component needed)

Future, only if a ticket asks for true time-series drill-down:
   └─ TrendChart.svelte   → thin wrapper around uPlot, mounted client:visible,
                             SSR fallback = the sparkline/table above (progressive enhancement,
                             not a loading spinner)
```

Guardrails carried over from this research:

- Every new visual is an **SSR-friendly, token-themed, first-party** component before any dependency is considered — matches the ladder's rung 1-2 default.
- Any canvas-based addition (rung 3) must ship an SSR/no-JS fallback (reuse the existing `<table>`/sparkline) so the page still communicates data without JS, matching Cloudflare Pages' static-first strengths and the project's accessibility bar.
- BI iframes stay documented as an *integration option* for real deployments, never the demo's default rendering path, and never loosen `public/_headers`' CSP unless a ticket explicitly enables that integration.
- No component here needs a new runtime dependency beyond (optionally, later) `uplot` — everything in the "proposed architecture" above ships with zero new `package.json` entries.

## Sources

- [LayerChart 2.0.0 release notes](https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0) / [bundle-size guide](https://layerchart.com/docs/guides/bundle-size)
- [LayerChart v1→v2 migration guide](https://next.layerchart.com/docs/guides/migrations/v1-to-v2/llms.txt)
- [LayerCake](https://layercake.graphics/) / [guide](https://layercake.graphics/guide) / [Svelte 5 support issue](https://github.com/mhkeller/layercake/issues/156)
- [uPlot README + benchmark table](https://github.com/leeoniya/uPlot) / [npm listing](https://www.npmjs.com/package/uplot)
- [Apache ECharts import/tree-shaking docs](https://echarts.apache.org/handbook/en/basics/import/) / [ECharts 5.5 SSR + lite runtime notes](https://echarts.apache.org/handbook/en/basics/release-note/5-5-0/) / [2026 JS chart library roundup](https://www.usedatabrain.com/blog/javascript-chart-libraries)
- [Chart.js integration/tree-shaking docs](https://www.chartjs.org/docs/master/getting-started/integration.html) / [`svelte5-chartjs`](https://github.com/LupusAI/svelte5-chartjs/) / [`svelte-chartjs`](https://github.com/sauravkanchan/svelte-chartjs)
- [Billboard.js v4 changelog + bundle impact](https://github.com/naver/billboard.js/blob/master/CHANGELOG-v4.md) / [billboard.js site](https://naver.github.io/billboard.js/)
- [Observable Plot SSR discussion](https://github.com/observablehq/plot/discussions/847) / [SvelteKit SSR walkthrough](https://travishorn.com/sveltekit-magic-server-side-rendering-for-observable-plot-explained/)
- [Looker Studio embed docs](https://cloud.google.com/looker/docs/studio/embed-a-report) / [CSP frame-src note](https://oneuptime.com/blog/post/2026-02-17-share-embed-looker-studio-reports-web-applications/view)
- [Metabase public embeds](https://github.com/metabase/metabase/blob/master/docs/embedding/public-links.md) / [COEP/CORP embedding issue](https://github.com/metabase/metabase/issues/67409)
- [Grafana embedding + anonymous access](https://last9.io/blog/how-to-get-grafana-iframe-embedding-right/) / [Grafana share docs](https://grafana.com/docs/grafana/latest/visualizations/dashboards/share-dashboards-panels/)
