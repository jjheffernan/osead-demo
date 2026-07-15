# Property content contract

Collection: `src/content/properties/*.md`  
Schema: `src/content.config.ts` → `properties`

## Required frontmatter

| Field | Notes |
| --- | --- |
| `title`, `description`, `slug` | Unique slug = PDP path |
| `listingType` | `sale` \| `rental` \| `both` |
| `market` | `outer-banks` \| `jersey-shore` \| `delaware-beaches` \| `other-coastal` |
| `town`, `regionLabel` | Human-facing location |
| `waterfront` | Taxonomy enum — keep stable for filters/SEO |
| `beds`, `baths` | baths may be half (2.5) |
| `locale` | `en` for now |

## Strongly recommended

- `sleeps`, `sqft`, `images[]` (specific alts; see `docs/demo-media.md`), `amenities[]`, `highlights[]`
- `geo`, `address` for schema richness
- `seoTitle`, `seoDescription`
- `weeklyRate` and/or `salePrice` matching listingType
- `checkInTime` / `checkOutTime` for rentals
- `uid` stable id for schema `identifier`

## Body

1–3 short paragraphs. Do not dump amenity lists in body (use `amenities`).

## Dual inventory

When `listingType: both`:

- Provide both `weeklyRate` (or nightly) and `salePrice`
- PDP shows both CTAs
- Emit both VacationRental and RealEstateListing JSON-LD
