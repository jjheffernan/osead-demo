# Research: conversion UX for coastal rentals + sales

Companion to [`coastal-luxury-patterns.md`](./coastal-luxury-patterns.md). That doc covers SEO IA, schema, and coastal design direction. **This doc** focuses on frontend practices that turn browsers into inquiries — for **OSEAD** (Astro pages + Svelte islands, Markdown inventory, faux booking → contact).

Aligned with [`docs/VISION.md`](../VISION.md): 50/50 rent/buy homepage, rentals primary in presentation, large-PMC filter feel (not market-first IA), never Zillow/Airbnb chrome, Fair Housing + demo disclaimer always visible, no CMS/DB/IDX.

S26 implements top P0 items from this plan. S28 owns testimonials wiring.

---

## Exemplars (≥5)

| # | Site | URL | What converts (steal the pattern, not the look) |
| --- | --- | --- | --- |
| 1 | **Twiddy** (OBX rentals) | https://www.twiddy.com/ | Search + facets first; town/waterfront/amenity density implies inventory scale; collection landings feed filters. **Steal:** filter-led browse, not map-first MLS. |
| 2 | **Vacasa** | https://www.vacasa.com/ | Sticky inquiry / availability near first viewport on PDP; price + sleeps + beds before long copy; mobile CTA always reachable. **Steal:** conversion rail sticky on desktop, bar on mobile. |
| 3 | **Evolve** (direct booking) | https://evolve.com/ | Trust within ~10s: reviews near CTA, clear “why book here,” short path from card → dates → inquire. **Steal:** social proof adjacent to CTA (not footer-only). |
| 4 | **Village Realty OBX** | https://villagerealtyobx.com/ | Luxury subset + local authority; dual rent/sale paths without burying either. **Steal:** signature homes strip + honest dual CTAs. |
| 5 | **The Agency** (sales) | https://www.theagencyre.com/ | Sales PDP hierarchy: hero media → price/facts → agent CTA; restrained chrome, photography-forward. **Steal:** showing CTA prominence without IDX grid aesthetics. |
| 6 | **Compass** (sales reference) | https://www.compass.com/ | Fast lead forms (name/email/phone), sticky “Request info,” short confirmation expectation. **Steal:** form brevity + response-time copy — **not** map-first search UI (Vision forbids Zillow clones). |

Industry practice sources (patterns, not brand look): [hostAI CRO](https://gethostai.com/blog/conversion-optimization-best-practices), [HomeRunner trust checklist](https://homerunner.io/blog/vacation-rental-website-design-that-guests-trust-in-under-10-seconds-a-practical-homepage-checklist/), [Houfy landing conversion](https://www.houfy.com/blog/vacation-rental-landing-page-that-converts-host-guide).

---

## Frontend UX/UI practice list

### Trust

- Fair Housing + **demo disclaimer** on every inventory surface (already via `ListingNotice.svelte` — keep adjacent to CTAs, not only footer).
- Response-time expectation near contact (“We reply within one business day”) — reduces OTA-safety anxiety on direct sites.
- Staff/face near conversion (home/about already have `Team.svelte`; PDP can link or show one contact face).
- Price honesty: show weekly / sale display + note fees are estimates (demo). Surprise fees kill conversion; transparency builds it even when numbers are sample.
- Never imply a confirmed paid reservation on faux booking (Vision).

### Density (large-PMC feel without clutter)

- Inventory indexes show **photo-forward cards** with beds/baths/sleeps/waterfront/price in one scan (`PropertyCard.svelte`).
- Result count + active filter chips so scale is felt even with ~12–20 seed homes.
- Homepage: brand hero first (one composition), then dense featured grids — not dashboard widgets or promo chip stacks (matches coastal-luxury + Vision brand-first rules).
- Avoid: MLS table chrome, map-dominant search, “similar homes” carousel spam.

### CTAs

| Surface | Primary | Secondary |
| --- | --- | --- |
| Home | Browse rentals | Homes for sale (equal visual weight; rentals slightly first) |
| Rentals/Sales index | Open filtered grid / collection links | Contact |
| Rental PDP | Check availability → contact | Ask a question |
| Sale PDP | Schedule a showing | Request info |
| Dual (`listingType: both`) | Both rails visible; rentals block first | — |

- CTAs use existing `Button.svelte` / link styles — one primary, one ghost; no pill-cluster noise.
- Mobile: keep primary action reachable after scroll (sticky bar or sticky aside).

### PDP order (target)

Ideal scroll for conversion (extends coastal-luxury rental order; adjusted for current gallery-first scaffold):

1. Breadcrumbs (inventory path, not market-first)
2. **Gallery** (decide visually first)
3. Title + location/waterfront + beds/baths/sleeps + price
4. **Conversion aside** (availability / showing) — sticky where layout allows
5. Trust line (notice + optional rating snippet — S28)
6. Highlights → amenities → long description
7. Related homes (same market/waterfront; already V11)
8. Soft local FAQ or link to journal (optional P2)

Current `src/pages/properties/[slug].astro` is close: gallery → header+aside → highlights → amenities → prose → related. Gaps: sticky aside, social proof near CTA, sale/rental CTA hierarchy polish, mobile sticky bar.

### Filters

- Primary browse = **filters + inventory** (`ListingFilters.svelte` on `/rentals`, `/sales`), not “pick market first” (Vision).
- Waterfront vocabulary consistent with content model (oceanfront, semi-oceanfront, oceanview, soundfront, bayfront, canal).
- Amenity chips that map to collections (`/collections/*`) for SEO + filter shortcuts.
- Show “N homes” and empty-state with clear reset — empty filters feel broken.

### Social proof

- Star rating + one short quote **within one scroll of the booking/showing CTA** (S28 component; plan for mount points here).
- Home or footer aggregate (“Guests rate stays…”) without OTA badge clutter.
- Partner/marketplace links already on home — keep secondary to direct inquire CTAs (direct > outbound).

---

## Gap vs current OSEAD (quick audit)

| Practice | Status | Notes |
| --- | --- | --- |
| Brand-first 50/50 home | Done | `src/pages/index.astro` |
| Filter-led rentals/sales | Done | `ListingFilters.svelte` |
| Faux availability → contact | Done | `AvailabilityInquiry.svelte` |
| Dual sale/rental CTAs | Partial | Aside has both; not sticky; weak mobile persistence |
| Trust next to CTA | Partial | `ListingNotice` present; no ratings yet (S28) |
| Card density / price on card | Mostly | Price optional; could emphasize listing type badge |
| Sticky mobile CTA | Missing | P0 |
| Response-time microcopy | Missing | P0 on contact + PDP aside |
| Result count / filter chips UI | Weak | P1 in `ListingFilters.svelte` |

---

## Prioritized implement plan (this repo)

Astro keeps pages/layouts/SEO. Svelte owns interactive UI. **Do not add CMS/DB/IDX.**

### P0 — S26 conversion density & trust (ship first)

1. **Sticky conversion rail on PDP (desktop aside + mobile bar)**  
   - Files: `src/pages/properties/[slug].astro` (layout/CSS), `src/components/properties/AvailabilityInquiry.svelte`, sale showing link block (keep in Astro or thin Svelte wrapper).  
   - Behavior: aside `position: sticky` below header; on small screens a compact bar with “Check dates” / “Schedule showing” that scrolls to the form or links to contact with intent.  
   - Respect demo disclaimer; no “Book now / paid” language.

2. **Trust + response expectation beside CTAs**  
   - Files: `src/components/properties/ListingNotice.svelte`, `src/pages/properties/[slug].astro`, `src/pages/contact.astro`.  
   - Add one line: demo inventory + typical reply window. Keep Fair Housing. Prep a mount slot comment/region for S28 testimonials under the aside.

3. **Homepage & index CTA clarity (rentals primary, sales equal)**  
   - Files: `src/pages/index.astro`, `src/pages/rentals/index.astro`, `src/pages/sales/index.astro`, `src/components/hero/Hero.svelte` (only if reused).  
   - Tighten first viewport to brand + one line + CTA pair (already close); ensure featured grids densify without extra chrome; secondary path cards don’t compete with hero.

### P1 — Filters, cards, dual-listing polish

4. **ListingFilters: result count + active chips + clearer empty state**  
   - File: `src/components/properties/ListingFilters.svelte`  
   - Wire collection deep-links from `CollectionLinks.svelte` where useful.

5. **PropertyCard conversion scan**  
   - File: `src/components/properties/PropertyCard.svelte` (+ `toPropertyCardProps` in `src/lib/properties.ts` if props needed)  
   - Optional listing-type badge; always-visible price when present; keep photo-dominant, no heavy card chrome (Vision).

6. **Dual-listing CTA order**  
   - File: `src/pages/properties/[slug].astro`  
   - For `listingType: both`, rentals inquiry first, showing second; shared sticky bar labels both actions.

### P2 — Nice-to-have after S26/S28

7. **PDP soft FAQ** — reuse `src/components/FAQ.svelte` with 2–3 static Qs (pets, weeks, showings) linking to contact.  
8. **Contact form field minimalism** — existing form components under `src/components/ui/form/*`; trim optional fields if any; strong success state already (V16).  
9. **SearchModal shortcuts** — `src/components/layout/SearchModal.svelte`: jump to rentals/sales/collections.  
10. **Media presence** — defer visual richness to S29/S30 (`docs/research/beachfront-media.md`); don’t block conversion P0 on new assets.

### Suggested S26 acceptance (for the build slice)

- Sticky or persistent primary CTA on PDP (desktop + mobile).  
- Trust/response copy visible next to inquire CTAs.  
- Home + rentals/sales still brand-first / filter-first; no map-first UI.  
- `pnpm build` green; no new backend services.

---

## Explicit non-goals

- CMS, database, or headless content platform  
- Live IDX / MLS sync or map-first listing search clones  
- Real payments, PMS calendar sync, or confirmed reservations  
- Multi-tenant admin / CRM  
- Redesigning away from weathered coastal tokens into OTA/Zillow chrome  
- Contradicting Vision market-secondary IA or Fair Housing / demo rules  

---

## How this extends coastal-luxury-patterns

| Topic | coastal-luxury-patterns | This doc |
| --- | --- | --- |
| Exemplars | SEO/IA focused | Conversion UX focused (overlap Twiddy/Village OK) |
| PDP order | Content/SEO sequence | CTA stickiness + trust adjacency |
| Design | Coastal tokens, photography | Same; adds density/CTA rules without new palette |
| Backend | Markdown + Pages Function | Same non-goals, restated for S26 |

When patterns conflict, **Vision wins**, then this conversion plan, then coastal-luxury SEO notes.
