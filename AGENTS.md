## AI Development System

This repo is an **OSEAD** coastal real estate template (weekly rentals + sales) operated by AI coding agents.

**Read first:**

- `docs/PLAN.md` — phased build plan
- `docs/research/coastal-luxury-patterns.md` — UX/SEO research
- `docs/afk/README.md` — overnight loop instructions
- `docs/specs/property-content.md` — listing frontmatter contract
- `system/globals/` — design knowledge (tokens, components, patterns)
- `src/config/site.config.ts` — brand input
- `src/registry.json` — component catalog

**Architecture:** Astro pages compose sections/components. Interactive bits are **Svelte 5 islands** (not React). Listings live in Markdown collections (`properties`, `markets`).

**Hard rules:**

- Colors/spacing/typography from design tokens only. No Tailwind palette utilities (`bg-blue-500`). Use semantic tokens.
- Keep backend light: no CMS/DB/booking engine unless a ticket explicitly asks.
- Preserve Cloudflare Pages, SEO (canonical/OG/sitemap/JSON-LD), and English-first i18n.
- Prefer ponytail ladder: reuse → native → minimal new code.
- For overnight work, follow `.agents/skills/after-hours/SKILL.md` and only pick `ready-for-agent` / `TODO.md` **Now** items with clear acceptance checks.

**Verify before done:** `pnpm build`, `pnpm lint` (includes `pnpm check:kpis`).
