# Research: high-end coastal real estate & vacation rental sites

Research synthesis for **OSEAD** — a template for premium beachfront **weekly rentals** and **sales** across Outer Banks, Jersey Shore, Delaware Beaches, and similar summer-home markets.

## Exemplars reviewed

| Site / pattern | What works | Steal for OSEAD |
| --- | --- | --- |
| [Twiddy](https://www.twiddy.com/) (OBX rentals) | Search-first IA; town + waterfront + amenity collections; huge inventory credibility | Faceted search landings (`/rentals/oceanfront`, `/markets/outer-banks/corolla`) |
| [Village Realty OBX](https://villagerealtyobx.com/) | Luxury subset pages; local authority copy; cover full barrier-island stretch | Featured “signature homes” + market narrative |
| [LBI Locals case study](https://inboundrem.com/high-traffic-real-estate-website-case-study/) | Resource content outranks Zillow for local queries; trip guides → buyer pipeline | Journal/guides as SEO engine, not afterthought |
| Coastal DE brokerages (category hubs) | Oceanfront / bayfront / canal / town / price band landings | `markets` + future `collections` content types |
| Luxury STR SEO practices ([HomeRunner](https://homerunner.io/blog/luxury-vacation-rental-seo-how-premium-stays-win-high-intent-search-traffic/), [hostAI](https://gethostai.com/blog/ocean-web-design)) | Long-tail intent titles; property pages closest to conversion; restrained “ocean” design | Title pattern: place + property type + differentiator |

## UX patterns that convert (rentals)

1. **Hero does one job:** brand + one headline + one supporting line + CTA pair (Browse rentals / Homes for sale). Avoid stat strips and promo chips in the first viewport.
2. **Photos dominate.** Gallery/cards immediately after (or instead of) a short hero; guests decide visually first.
3. **Property page order:** name/location → beds/baths/sleeps → short description → gallery → amenities → map/policies → inquiry CTA → related homes + local FAQ.
4. **Waterfront vocabulary is product taxonomy:** oceanfront, semi-oceanfront, oceanview, soundfront, bayfront, canal — use consistently in filters, URLs, and schema.
5. **Town identity matters** more than brand name for SEO (Corolla ≠ Nags Head ≠ Dewey).

## UX patterns that convert (sales)

1. Dual CTAs: **Schedule showing** vs **Request rental dates** when `listingType: both`.
2. Surface **rental upside** honestly on sale PDPs when weekly history exists (demo: price display + notes).
3. Category pages beat raw MLS dumps: “Oceanfront over $1M”, “Bayfront Dewey”, “LBI ocean block”.

## SEO architecture (target)

```
/                         Home (brand + paths to rent + buy)
/rentals                  Weekly inventory index
/sales                    Sale inventory index
/markets/{market}         Destination authority + listings
/properties/{slug}        PDP (schema + conversion)
/collections/{slug}       Intent pages (oceanfront, pets, large groups) — AFK
/blog|journal/{slug}      Guides that feed markets (AFK content)
/contact                  Light inquiry (Pages Function)
```

### On-page SEO rules

- Unique `seoTitle` / `seoDescription` per property and market.
- URLs include place + type where readable: `/properties/dune-crest-corolla`.
- Image `alt` describes space + location (not keyword stuffing).
- Internal links: property ↔ market ↔ collection ↔ journal guide.
- Sitemap + canonical + hreflang-ready i18n (starter already ships English-first).

### Structured data

| Inventory | Schema | Notes |
| --- | --- | --- |
| Weekly rentals | [`VacationRental`](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental) | Prefer ≥8 real photos in production; geo + occupancy required for rich eligibility |
| Sales | `RealEstateListing` + `Offer` | Helps classification even without flashy rich results |
| Dual homes | Emit **both** blocks when `listingType: both` | Already scaffolded in `src/lib/property-schema.ts` |

Sources: [Google VacationRental docs](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental), [Premier Possible structured data overview](https://premierpossible.com/premier-possible-structured-data-boost-real-estate-hotel-seo/).

## Design direction (premium coastal, not cliché)

- Prefer **deep coastal ink**, cool off-white, restrained teal-slate accents — not saturated tourist blues or seashell kitsch.
- Photography > illustration. Full-bleed heroes for market pages; listing cards are interaction containers, not decorative card chrome.
- Typography: keep expressive fonts from the design system (`Outfit` / `Manrope` already in starter); avoid Inter/Roboto defaults.
- Motion: subtle hero fade, gallery crossfade, filter panel — not glow/particles.

## Backend light (demo constraint)

Keep:

- Markdown content collections (properties, markets, blog)
- Cloudflare Pages static output
- Optional Pages Function for contact inquiry
- Optional R2 for media later

Defer / avoid for MVP demo:

- Full PMS/booking engine + payments
- Live MLS IDX (use seeded Markdown or a sync script later)
- Custom user accounts / CRM
- Heavy map tile backends — embed MapLibre/Leaflet client island only if needed

## Keyword families (seed)

**Rentals:** `oceanfront vacation rental {town}`, `weekly beach house {market}`, `pet friendly Outer Banks rental`, `{beds} bedroom oceanfront Corolla`

**Sales:** `{town} oceanfront homes for sale`, `LBI ocean block homes`, `Dewey Beach bayfront condo`, `second home Outer Banks`

**Guides:** `best beach access {town}`, `{market} weekly rental guide`, `buying a vacation home on LBI`

## Implications for OSEAD template

1. Content model must encode **listingType**, **market**, **waterfront**, pricing axes, amenities.
2. Svelte for site UI (SSR by default); hydrate with `client:*` only where interaction pays off (filters, gallery, inquiry form, nav, theme).
3. AFK backlog should prioritize SEO page types and listing UX before decorative polish.
4. Template swaps: `site.config.ts`, logos, seed Markdown — then redeploy Pages.
