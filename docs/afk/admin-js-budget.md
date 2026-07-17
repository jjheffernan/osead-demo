# Admin client JS budget

Snapshot of what ships JS to the browser for `/account` (admin workspace) and why.

## Islands (Astro hydration boundary)

Only the top-level component in an `.astro` file carries a `client:*` directive; everything nested inside it is plain Svelte and hydrates as part of that same island — it does not add a second boundary.

| Component | Hydration | Where |
| --- | --- | --- |
| `AdminShell.svelte` | `client:load` | `src/pages/account.astro` — sole admin island; gated behind a demo-session check so it only mounts for `role: admin` |
| `AccountAuthForm.svelte` | `client:load` | `src/pages/login.astro`, `src/pages/register.astro` — separate, non-admin island (auth form needs input handlers immediately) |
| `AdminAnalytics.svelte` | inherited (nested in `AdminShell`) | rendered inside the `analytics` panel |
| `SalesSparkline.svelte` | inherited (nested in `AdminAnalytics`) | inline `<svg>`, no library |
| `ContentEditor.svelte` | inherited (nested in `AdminShell`) | rendered inside the `content` panel |

No admin component uses `client:visible`/`client:idle`/`client:only`, and no admin surface is SSR-only — the whole workspace is behind a client-side demo-session gate (`readDemoAccount()`), so `client:load` on `AdminShell` is the correct (and only) choice; a lazier directive would flash the signed-out gate markup.

## Chart / admin-kit dependency check

Grepped `package.json` and source for chart and react-admin kits:

- `chart.js`, `uplot`, `echarts`, `recharts`, `victory`, `d3-shape`, `react`, `react-admin`, `refine`, `antd` — **zero matches** in `dependencies`/`devDependencies` or imports.
- The one text hit (`ListingFilters.svelte`: "Refine the collection") is copy, not the `refine` package.
- All admin visualizations (`SalesSparkline`, market tiles, leaderboard bars, KPI strip) are native inline SVG/CSS per `docs/research/admin-analytics-v-slices.md` — no chart library ever landed.

## Budget takeaway

One admin island (`AdminShell`, `client:load`) plus one unrelated auth island (`AccountAuthForm`, `client:load` on `/login` + `/register`). No chart/react-admin weight anywhere.
