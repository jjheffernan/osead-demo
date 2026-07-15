# AFK loop — OSEAD

Prep docs so [`after-hours`](../../.agents/skills/after-hours/SKILL.md) can build the coastal template overnight with low babysitting.

## Installed skills

| Pack | Skills | Use |
| --- | --- | --- |
| [heff-skills](https://github.com/jjheffernan/heff-skills) | `after-hours`, `after-hours-stop`, `after-hours-handoff` | Unattended A→Z tickets → draft PRs → morning brief |
| [caveman](https://github.com/JuliusBrussee/caveman) | `/caveman` family | Terse agent output during long runs |
| [ponytail](https://github.com/DietrichGebert/ponytail) | rules + `/ponytail*` | YAGNI — do not invent booking backends |

## One-time arming checklist

1. Confirm `gh` auth: `gh auth status`
2. Prefer a clean git tree
3. Edit `.cursor/after-hours-loop.config.json` (repo, testCommand already seeded)
4. Queue work as **GitHub issues** with label `ready-for-agent` **or** entries under `TODO.md` → section `Now`
5. Dry-run first:

```text
/after-hours --dry-run
Sources:
  - github-issues: label ready-for-agent limit 5
  - todo-md: section "Now"
maxPrs: 3
priority: github-first
```

6. Arm:

```text
/after-hours 45m
Sources:
  - github-issues: label ready-for-agent limit 5
  - todo-md: section "Now"
maxPrs: 3
priority: github-first
```

7. Morning: read `.cursor/after-hours-morning-brief.md`, review draft PRs, score with heff-skills scorecard patterns.

Stop phrases: `stop after-hours` · `stop loop` · `/after-hours stop`

## Ticket quality bar (required for AFK)

Every `ready-for-agent` issue / TODO item MUST include:

- **Goal** (one sentence)
- **Scope in / out**
- **Files likely touched**
- **Acceptance checks** (commands + manual)
- **Forbidden** (e.g. “no new CMS”, “no purple glow”)

Copy the template in [ticket-template.md](./ticket-template.md).

## Recommended night Sources

Paste from:

- `.agents/skills/after-hours/templates/night-Sources.mixed.txt`
- Or [sources.osead.night.txt](./sources.osead.night.txt)

## Priority order for agents

1. Green build / lint after schema or route changes
2. Listing UX (gallery, filters) — conversion surface
3. SEO collection/town pages
4. Inquiry Function polish
5. Visual polish only after functional SEO paths exist

## Guardrails

- Stay on design tokens (`system/globals`, `check:kpis`)
- **Stack order:** Astro (pages/layouts/SEO) → Svelte 5 (UI, SSR default) → TypeScript (config/schemas/queries/Functions/tests only)
- Prefer new UI as `.svelte`; use `client:*` only for interaction (filters, gallery, nav, theme, forms)
- Do not grow TypeScript for presentational UI or barrels
- Markdown remains source of truth for listings
- Draft PRs only (`draftPrs: true`)
- Do not commit secrets; `.env*` stays local
- Ponytail: if native HTML / existing component works, use it

## Artifacts agents may write

- Code + content under `src/`
- Docs under `docs/` when ticket says so
- State: `.cursor/after-hours-loop.state.json` (gitignored)
- Brief: `.cursor/after-hours-morning-brief.md` (gitignored)
