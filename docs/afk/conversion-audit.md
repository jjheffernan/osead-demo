# Conversion improvement audit (S27)

Post-build pass after **S26** (`7428c7c`) and **S28** (`349509f`). Source plan: [`docs/research/conversion-ux.md`](../research/conversion-ux.md). Media richness is owned by **S30** — this audit does not change hero imagery.

## What shipped

### S26 — conversion density & trust (P0)

| Item | Where | Status |
| --- | --- | --- |
| Sticky PDP conversion rail (desktop) | `properties/[slug].astro` aside `position: sticky` | Done |
| Mobile sticky inquiry bar | `#availability-inquiry` / sale contact links | Done |
| Response-time copy beside CTAs | PDP aside, `AvailabilityInquiry`, `ListingNotice`, contact form | Done |
| Fair Housing + demo notice near inquire | `ListingNotice` on PDP + rentals/sales indexes | Done |
| Home CTA clarity (rentals primary, sales equal) | `index.astro` hero + path cards + featured grids | Done |
| Index lead → contact with intent | `/rentals`, `/sales` | Done |
| Dual-listing order (rentals block first) | Aside + mobile bar | Done |

### S28 — social proof near conversion

| Item | Where | Status |
| --- | --- | --- |
| Listing ratings near CTA | Compact `Testimonials` in PDP aside + full section below | Done (when seed exists for slug) |
| Business proof on home | Compact block after Team | Done |
| Staff + office ratings on about | `Testimonials` + `RatingSubmit` | Done |
| Submit path via contact Function | `RatingSubmit` → `/api/contact` | Done |

## Residual surface (do not treat as S27 scope)

### P1 — polish still open

1. **Active filter summary chips** — amenity checkboxes exist; beds/baths/waterfront lack removable “active” chips summarizing the query (research P1).
2. **PropertyCard listing-type badge** — price shows when present; no rental/sale/both badge for dual-inventory scan.
3. **ListingFilters empty density** — count + clear exist; empty state now has an inline Clear (S27). Still no collection deep-link chips beyond `CollectionLinks` above the grid.
4. **Sale secondary CTA parity** — “Request info” / “Ask a question” text link added on PDP (S27). Mobile bar still primary-only (fine for sticky budget).

### P2 — nice-to-have (research)

5. Soft PDP FAQ (`FAQ.svelte`, pets/weeks/showings → contact).
6. Contact form field trim (already name/email/intent/message — little to cut).
7. `SearchModal` shortcuts to rentals/sales/collections.
8. Staff face on PDP rail (about/home already have `Team`).

### Explicit deferrals

| Topic | Owner | Why |
| --- | --- | --- |
| Hero / gallery media presence | **S30** | Beachfront media plan; avoid fighting that work here |
| Live booking / IDX / maps search | Never (Vision) | Faux inquire only |
| Aggregate “Guests rate stays…” footer strip | Later | Home already has business testimonials |

## Surfaces skimmed (S27)

| Surface | Conversion read |
| --- | --- |
| Home | Brand-first hero, dual CTAs with inventory counts, featured grids, trust after Team — solid. Hero still texture-only (S30). |
| Rentals / Sales | Filter-first, notice + collection links, live result count — solid. |
| PDP | Gallery → facts → sticky rail → related; mobile bar; ratings when seeded — solid. |
| Contact | Response expectation + demo disclaimer + success state — solid. |
| About | Team + ratings + inquire close — solid. |

## Trivial wins applied in S27

1. **PDP a11y** — ratings section used `aria-labelledby` without a matching id → `aria-label`.
2. **PDP secondary CTA** — “Ask a question” / “Request info” text link under the rail → contact with intent + property.
3. **Empty filters** — Clear filters button inside the empty-state message.
4. **PropertyCard meta** — waterfront labels replace all hyphens (`semi-oceanfront` → readable).

## Acceptance

- [x] Residual surface documented here
- [x] Trivial wins only (no redesign, no hero media)
- [x] `pnpm build` green
- [x] TODO S27 marked done
