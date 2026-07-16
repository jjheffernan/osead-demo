# Research: beachfront media that keeps people on the page

Research for **S29** → build in **S30**. Complements [`coastal-luxury-patterns.md`](./coastal-luxury-patterns.md) (IA/SEO) with a media-first lens: what impressive coastal housing sites *show*, how they pace attention, and what OSEAD can ship on Astro + Svelte without scraping photography.

**Constraint reminder:** demo inventory uses illustrative SVGs under `public/images/` — see [Asset policy](#asset-policy) and [`docs/demo-media.md`](../demo-media.md).

---

## Impressive sites (≥5) — what the media does

| Site | Category | What the media does |
| --- | --- | --- |
| [Twiddy](https://www.twiddy.com/) (OBX rentals) | High-inventory coastal STR | Photo/video as the decision surface: search → large listing cards → deep galleries. Town and amenity hubs lead with place photography so inventory feels local, not generic. Campaign work has pushed **cinematic page headers** (video where bandwidth allows) without replacing the search-first IA. |
| [The Perigon Miami Beach](https://perigonluxuryresidencesmiamibeach.com/) | Oceanfront sales / development | Full-bleed architecture + ocean imagery as a **scroll narrative**: scarcity story → residence types → finishes → amenities. Media sections are sparse and large; copy stays short under each visual beat. Floor plans / visual tour are gated as progressive reveal, not a dump. |
| [The Strand TCI](https://thestrandtci.com/) | Beachfront resort + residences | Atmosphere-first: bay/horizon photography frames “slower mornings / open-air living.” Residences are sold as **view + terrace lifestyle**, not amenity checklists. Motion is restrained; stills carry the brand. |
| [Ocean Blue Barbados](https://oceanbluebarbados.com/) | Oceanfront residences (+ rental program) | Soft coastal light, interiors with outdoor connection, turn-key lifestyle stills. Media sells **dual use** (live / rent) by showing lived-in spaces rather than empty renders alone. |
| [Village Realty OBX](https://villagerealtyobx.com/) | Luxury coastal brokerage | Signature-home photography and barrier-island coverage: media establishes **local authority** before brand. Luxury subset pages use fewer, better frames rather than MLS-tile density. |
| [Plum Guide](https://www.plumguide.com/) (luxury STR pattern) | Curated luxury stays | Editorial-quality hero + gallery discipline: one dominant frame, then a paced sequence. Trust is visual (home quality) before price. Useful as a **gallery hierarchy** reference even when inventory is smaller than Twiddy. |

**Pattern takeaway:** winners treat media as product, not decoration. Heroes are edge-to-edge planes; galleries are decision tools; markets/destinations get place imagery that inventory cards then reinforce.

---

## Stay-on-page techniques

Techniques observed across the exemplars that increase time-on-page and reduce bounce *without* gimmicks:

### Media

1. **One dominant first-viewport plane** — full-bleed still or slow video; brand + one line + CTA on top. No inset collage, floating badges, or stat strips in the hero.
2. **Photo before copy on inventory** — cards are mostly image; meta (beds / waterfront / town) rides under the frame.
3. **Gallery as the PDP spine** — large primary frame + thumbnails; keyboard/swipe; optional video last, not first (LCP).
4. **Place continuity** — market hero → town/collection → listing cards share a visual dialect (light, horizon, wood/salt textures) so scrolling feels like one coast.
5. **Honest demos** — when photography isn’t real MLS, mark it; users forgive labeled placeholders more than fake “stock beach” that looks stolen.

### Scroll & hierarchy

6. **One job per section** — after hero: paths (rent/buy) *or* featured homes *or* markets — not all three competing in one band.
7. **Visual beats over walls of text** — short lead under a large image; long copy belongs in journal/guides, not the first three screens.
8. **Sticky inquiry only after the gallery has earned trust** — CTA appears once the home is “seen,” not as a floating chip over the hero.
9. **Related homes as a loop** — end of PDP returns users to more photos (same market / waterfront), not a dead footer.

### Motion restraint

10. **Prefer opacity/transform fades** (hero reveal, gallery crossfade) over parallax stacks, particles, or glow.
11. **Respect `prefers-reduced-motion`** — disable autoplay video and decorative motion.
12. **Lazy-load below the fold**; keep LCP candidate (hero or first gallery image) eager + sized.
13. **No auto-advancing carousels** as the primary story — user-driven gallery keeps attention longer and avoids CLS.

---

## Current OSEAD media baseline (gap)

| Surface | Today | Gap vs exemplars |
| --- | --- | --- |
| Home | `src/pages/index.astro` — brand-first hero with grain/gradient, **no media plane** | Missing the edge-to-edge visual that coastal sites use to hold the first scroll |
| Markets | `MarketHero.svelte` + SVG heroes via `heroImage` | Good bones; can deepen immersion (veil tuning, optional slow ken-burns *only* if reduced-motion safe) and stronger card→hero continuity |
| PDP | `PropertyGallery.svelte` early in `properties/[slug].astro` | Already media-first; S30 should polish hierarchy, LCP, and demo labeling — not rebuild |
| Cards | `PropertyCard.svelte` | Image-led; ensure aspect ratio + demo alt discipline stay consistent |

Reusable pieces already in tree: `Hero.svelte` (split/media snippet), `Img.astro`, `ArticleHero.svelte` (blog), demo SVGs in `public/images/{markets,properties}/`.

---

## Prioritized implement plan (S30)

Concrete `src/` / `public/` touchpoints. **Do not scrape photos.** Extend the SVG demo set or add clearly marked public-domain stills only.

### P0 — ship first (highest stay-on-page / brand lift)

| # | Tactic | Where | Notes |
| --- | --- | --- | --- |
| P0.1 | **Full-bleed home hero media plane** | `src/pages/index.astro` (`.home-hero`); optional reuse of `src/components/hero/Hero.svelte` split/media or inline CSS matching `MarketHero` veil pattern; new SVG e.g. `public/images/markets/hero-home.svg` or reuse strongest market hero | One composition: brand wordmark + one line + CTA pair over edge-to-edge media. No overlays/badges. Eager LCP image; grain can sit above media at low opacity. |
| P0.2 | **PDP gallery hierarchy + LCP hygiene** | `src/components/properties/PropertyGallery.svelte`; call site `src/pages/properties/[slug].astro` | Larger primary stage, clearer “n of m,” ensure first image is the LCP candidate (`fetchpriority` / no lazy on index 0). Keep video after photos. |
| P0.3 | **Featured-home visual density on home** | `src/pages/index.astro` featured rental/sale grids + `PropertyCard.svelte` | Immediately under paths (or replace a weak band): large cards so the second viewport is *homes*, not more chrome. |

### P1 — next (destination immersion + continuity)

| # | Tactic | Where | Notes |
| --- | --- | --- | --- |
| P1.1 | **Market hero presence pass** | `src/components/markets/MarketHero.svelte`; `src/pages/markets/[slug].astro`, `markets/index.astro`, town page if present | Tune min-height / veil for readable type; keep town chips in content, not floating on media. |
| P1.2 | **Demo media banner on galleries** | `PropertyGallery.svelte` and/or `ListingNotice.svelte` | One quiet line: “Demo imagery — illustrative, not a real listing photo.” Aligns with Fair Housing / demo honesty. |
| P1.3 | **Expand SVG set by waterfront dialect** | `public/images/properties/*`, `public/images/markets/*`; frontmatter in `src/content/properties/*.md`, `src/content/markets/*.md` | More variety so cards don’t feel like one tile repeated; keep README + `docs/demo-media.md` updated. |
| P1.4 | **Subtle enter motion** | Home hero CSS; gallery selected-frame crossfade in `PropertyGallery.svelte` | Opacity/transform only; honor `prefers-reduced-motion`. |

### P2 — later (nice-to-have; defer if LCP or scope slips)

| # | Tactic | Where | Notes |
| --- | --- | --- | --- |
| P2.1 | Optional muted hero **loop video** (≤1 short clip) | Home only; poster = P0.1 still | Demo-marked; never autoplay sound; skip if reduced-motion. Prefer YouTube/file already supported on PDP before inventing a home player. |
| P2.2 | Lightbox / focus-trap for gallery | `PropertyGallery.svelte` | Improves dwell; keep keyboard path. |
| P2.3 | Market “atmosphere” strip below hero | `src/pages/markets/[slug].astro` | 2–3 wide frames (SVG) before property grid — place story, then inventory. |
| P2.4 | Collection / rentals index media headers | `src/pages/rentals/index.astro`, `collections/[slug].astro` | Thin full-bleed band matching market dialect — only after P0/P1 land. |

**Out of scope for S30:** CMS, booking engine, scraped Unsplash dumps without license notes, heavy parallax, particle oceans, third-party “virtual tour” embeds that hurt LCP.

---

## Asset policy

**Allowed for the OSEAD demo**

| Kind | Rule |
| --- | --- |
| **SVG demo artwork** | Preferred. Original illustrative coastal frames in `public/images/**` with `demo-` / `hero-` naming. Document in folder README + [`docs/demo-media.md`](../demo-media.md). |
| **Public domain / clearly licensed stills** | Only with license + attribution recorded next to the file (README row or frontmatter comment). Prefer CC0 / agency-cleared; never hotlink. |
| **Clearly marked placeholders** | Visible “demo / sample media” labeling on PDPs/galleries when frames are not real listing photos. |

**Forbidden**

- Random scraped photos from broker/STR sites or Google Images
- Unattributed stock that could be mistaken for a real OSEAD listing
- Heavy unoptimized photo dumps that tank LCP (if photos arrive later: WebP/AVIF, ~≤200KB targets per [`demo-media.md`](../demo-media.md))

**Alts:** describe scene + place context (e.g. “Oceanfront dunes at dusk — Outer Banks demo frame”), never “placeholder” or keyword stuffing.

---

## Acceptance bridge → S30

S29 done when this doc exists with sites, techniques, and P0/P1/P2 touchpoints.  
S30 done when P0 items land, assets stay license-safe / demo-marked, and `pnpm build` passes without a large LCP regression on home + one PDP.
