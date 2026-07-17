# Admin analytics — 3-phase feature push

**Status:** Phase 2 complete · Phase 3 Wave G armed in `TODO.md` (AFK continuing)  
**Goal:** One-stop admin analytics on login — first-party demo data + plug-in path for real RE analytics platforms. Stack stays Astro 7 → Svelte 5 → thin TS on Cloudflare Pages.

## Phases

| Phase | Mode | Outcome |
| --- | --- | --- |
| **1 Plan** | Research → validate → V-slice plan | Reports + build phases in this folder / `docs/PLAN` slice |
| **2 Rollout** | `/after-hours` 5m · max 10 local slices · no HITL · overwatch only | Vertical slices committed on `main` |
| **3 Cleanup** | Human-led merge + dashboard polish | Cohesive Overview/Analytics one-stop shop; JS budget check |

## Phase 1 artifacts (expected)

| Artifact | Owner | Path |
| --- | --- | --- |
| RE platforms crawl | Research agent | `docs/research/re-analytics-platforms.md` |
| Presentation / chart stack | Research agent | `docs/research/admin-dashboard-presentation.md` |
| Validation pass | Secondary swarm | `docs/research/admin-analytics-validation.md` |
| V-slice build plan | High-power synthesizer | `docs/research/admin-analytics-v-slices.md` (+ `TODO.md` Now) |

## Existing contract (do not throw away)

- Seed + loader: `src/lib/admin-analytics.ts`
- Plug-in: `PUBLIC_ADMIN_ANALYTICS_URL` or `window.__OSEAD_ADMIN_ANALYTICS__`
- UI today: `AdminAnalytics.svelte` behind AdminShell `#analytics`
- Screenshot target: denser Overview + Analytics as broker/manager one-stop shop

## Phase 2 arming (after V-slices land)

1. Promote slices into `TODO.md` **Now** (one checkbox = one subagent).
2. Set `.cursor/after-hours-loop.config.json`: `tickIntervalMinutes: 5`, `maxPrs: 10`, keep `workOnMain` + `skipGithubPr` + `localMerge`.
3. Commit/clean dirty tree first (`stopOnDirtyTree`).
4. Run `/after-hours 5m` — parent **overwatches only**; janitor between build waves for stall / style / TS bloat.
5. Stop phrases only: `stop loop`, `stop after-hours`, `/after-hours stop`.

## Phase 3 (after AFK)

- Merge drift into one AdminShell composition matching the screenshot density bar + richer analytics panels.
- Audit unused client JS; keep charts as Svelte islands with `client:visible` only where needed.
- Conversion bar: brokers should want this view enough to white-label the template.
