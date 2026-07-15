# OSEAD build plan

**Product:** Template-ready high-end coastal real estate site for **weekly rentals** + **sales**.  
**Stack (authoring order):** Astro 7 (pages/layouts/SEO/endpoints) → Svelte 5 (UI: SSR by default; `client:*` only for interaction) → thin TypeScript (config, content schemas, lib queries, Pages Functions, tests). Cloudflare Pages + Markdown collections.  
**Starter base:** [astro-cloudflare-starter](https://github.com/milzamsz/astro-cloudflare-starter) + Svelte swap.

## North star

A brokerage/management demo can fork this repo, replace brand + seed listings, and deploy to Cloudflare Pages without standing up a database or CMS.

## Phases

### Phase 0 — Scaffold (done in this session)

- [x] Install agent skills (heff-skills / caveman / ponytail)
- [x] Import Astro Cloudflare starter
- [x] Replace React islands with Svelte
- [x] Brand config → OSEAD
- [x] `properties` + `markets` collections + sample inventory
- [x] Routes: `/rentals`, `/sales`, `/markets`, `/properties/[slug]`
- [x] Dual JSON-LD helpers
- [x] AFK documentation + after-hours config seeds

### Phase 1 — Listing experience (AFK wave A)

Priority tickets in `TODO.md` / GitHub `ready-for-agent`:

1. Property gallery island (Svelte) with keyboard a11y
2. Listing filter island (beds, baths, waterfront, market, listingType)
3. Related properties on PDP
4. Breadcrumbs + FAQ schema on market pages
5. Replace SVG placeholders with optimized Unsplash/license-safe coastal set (or clearly marked demo media)

### Phase 2 — SEO destinations (AFK wave B)

1. `collections` content type (oceanfront, pets, 8+ bedrooms, elevator, pool)
2. Town landings under markets (`/markets/outer-banks/corolla`)
3. Journal posts linking into markets + collections
4. `llms.txt` / OG copy tuned for coastal keywords
5. Programmatic sitemap priorities for PDP + market URLs

### Phase 3 — Conversion light (AFK wave C)

1. Inquiry form Svelte island → existing/contact Pages Function
2. Separate rental-date vs sale-showing payloads
3. Thank-you page + basic rate limiting via Function
4. Optional email via Resend/Mailchannels **only if secrets present**

### Phase 4 — Template polish (AFK wave D)

1. Coastal design-token pass (still on-system: no hardcoded Tailwind palette utilities)
2. Brand-first homepage hero (OSEAD as dominant wordmark)
3. Market page full-bleed photography
4. Docs Starlight section: “White-label this template”
5. Demo seed of 12–20 properties across three markets

### Phase 5 — Explicit non-goals (unless requested)

- Full calendar booking + payments
- Live IDX/MLS sync
- Multi-tenant SaaS admin
- Native mobile apps

## Architecture decisions

| Decision | Choice | Why |
| --- | --- | --- |
| UI | Svelte 5 | All site UI; SSR default; hydrate only when interaction pays off |
| Pages | Astro 7 | Routing, layouts, content loading, SEO head |
| Glue | TypeScript | Config, Zod schemas, queries, Functions, tests only |
| Content | Astro content collections | Git-based, type-safe, demo-friendly |
| Hosting | Cloudflare Pages | Static + optional Functions/R2 |
| Schema | VacationRental + RealEstateListing | Matches dual inventory |
| Backend | Minimal | Spin up demos in minutes |

## Definition of done (demo-ready template)

- `pnpm build` + `pnpm lint` green
- ≥3 markets, ≥8 properties, both rentals and sales
- Filterable rentals/sales indexes
- SEO meta + JSON-LD on PDPs
- Contact inquiry works in preview
- `docs/TEMPLATE.md` explains white-label steps
- Cloudflare Pages deploy documented

## Doc map

| Doc | Purpose |
| --- | --- |
| [research/coastal-luxury-patterns.md](./research/coastal-luxury-patterns.md) | Competitive + SEO research |
| [afk/README.md](./afk/README.md) | How to arm overnight builds |
| [afk/backlog.md](./afk/backlog.md) | Machine-readable ticket list |
| [afk/acceptance.md](./afk/acceptance.md) | Done checks per ticket type |
| [specs/property-content.md](./specs/property-content.md) | Content schema contract |
| [TEMPLATE.md](./TEMPLATE.md) | White-label checklist |
| `TODO.md` (repo root) | After-hours `todo-md` Source |
