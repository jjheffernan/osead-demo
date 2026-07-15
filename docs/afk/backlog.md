# AFK backlog (seed)

Use these as GitHub issues (`label: ready-for-agent`) or copy into `TODO.md` → **Now** one at a time. Keep max concurrent agent work small (`maxPrs: 3`).

## Wave A — Listing UX

### A1 — Property gallery Svelte island
- Goal: Interactive gallery on `/properties/[slug]` with thumbnails + keyboard support.
- Scope in: Svelte 5 component, wire into PDP, a11y roles.
- Scope out: Video tours, 3D.
- Files: `src/components/properties/PropertyGallery.svelte`, `src/pages/properties/[slug].astro`
- Acceptance: `pnpm build`; keyboard arrows work; no React imports.

### A2 — Listing filters Svelte island
- Goal: Filter rentals/sales by beds, baths, waterfront, market, amenities.
- Scope in: Client filter over serialized listing props; URL query sync optional.
- Scope out: Server-side search DB.
- Files: `src/components/properties/ListingFilters.svelte`, rentals/sales indexes
- Acceptance: Filtering 4 seed listings without full page reload; `pnpm test` if unit tests added.

### A3 — Related properties
- Goal: Show 3 related homes same market or waterfront on PDP.
- Acceptance: Links resolve; no drafts shown.

### A4 — Breadcrumbs component on market + property pages
- Acceptance: Visible trail Home → Markets → …; JSON-LD BreadcrumbList optional bonus.

## Wave B — SEO destinations

### B1 — Collections content type
- Goal: `src/content/collections/*.md` + `/collections/[slug]` for oceanfront, pets, large-group, elevator.
- Acceptance: Schema validates; pages in sitemap; each collection lists matching properties via amenity/waterfront rules documented in frontmatter.

### B2 — Town pages under markets
- Goal: `/markets/outer-banks/corolla` style nested landings (or flat `/towns/corolla` if simpler).
- Acceptance: Unique title/description; lists town properties.

### B3 — Three SEO journal posts
- Goal: OBX oceanfront week guide, LBI buying guide, Delaware bayfront vs oceanfront.
- Acceptance: Internal links to markets + ≥1 property each; blog build green.

### B4 — Expand seed inventory to 12 properties
- Goal: Balanced rentals/sales across 3 markets; real alt text; geo coords.
- Acceptance: Content schema passes; indexes non-empty.

## Wave C — Conversion

### C1 — Inquiry form island
- Goal: Svelte form posting to Pages Function with `intent: rental | sale`.
- Acceptance: Works in `wrangler pages dev` or documented mock; validation errors inline.

### C2 — Contact thank-you + honeypot
- Acceptance: Bot field ignored; success state without new backend services.

## Wave D — Template polish

### D1 — Coastal tokens sync
- Goal: Align `colors.css` OKLCH tokens with `site.config.ts` branding without Tailwind palette utilities.
- Acceptance: `pnpm check:kpis` clean.

### D2 — Brand-first homepage
- Goal: OSEAD wordmark dominates first viewport per design rules; one CTA group; featured homes below fold.
- Acceptance: Manual screenshot review note in PR.

### D3 — TEMPLATE.md walkthrough test
- Goal: Follow white-label steps on a throwaway config and document gaps.
