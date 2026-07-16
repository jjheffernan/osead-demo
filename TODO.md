# TODO

Vertical slices for after-hours. One slice = one subagent. Prefer **commits on `main`** (no PR; avoid branch-merge HITL). Mark done with `[x]` when landed. Keep Astro for pages/layouts/SEO.

Vision SoT: `docs/VISION.md`  
Backlog seed: `docs/afk/backlog.md` · Plan: `docs/PLAN.md`

**Deploy gate:** Do **not** run the Cloudflare Pages deploy checklist until every open item in **Now** is `[x]`. Deploy lives under **Later** on purpose.

## Now

### Wave E — TS placement + conversion UX + media + testimonials

- [x] S24 TS placement: move what can into Astro frontmatter or Svelte modules; **keep** Astro pages/layouts/SEO/Img/Icon; do not delete Astro UI just to chase language % — acceptance: `pnpm build` + short note in `docs/afk/ts-placement.md` of must-keep vs moved
- [x] S25 Conversion UX research+plan: high-conversion RE sites → audit frontend practices → plan for Astro+Svelte in `docs/research/conversion-ux.md` — acceptance: ≥5 exemplars, practice list, prioritized implement plan
- [ ] S26 Conversion UX build: implement top plan items from S25 (homepage/PDP/listings density & trust) — acceptance: `pnpm build`, visible UX changes, no new CMS/DB
- [ ] S27 Conversion improvement audit: post-build pass; list residual surface in `docs/afk/conversion-audit.md`; fix trivial wins only — acceptance: audit doc + `pnpm build`
- [ ] S28 Testimonials: Svelte component for ratings of listings, staff, and business/office; seed demo content; submit path via existing contact Function or static seed — acceptance: wired on about + ≥1 PDP + home or footer; `pnpm build`
- [x] S29 Beachfront media research+plan: impressive beachfront sites → stay-on-page techniques → implement plan in `docs/research/beachfront-media.md` — acceptance: ≥5 sites, technique list, prioritized plan
- [ ] S30 Media build: implement S29 plan (hero/media presence; license-safe or clearly marked demo assets) — acceptance: `pnpm build`, richer media on home/markets/PDP without breaking LCP badly

### Wave 0 — Complete (do not re-open)

- [x] V1 Delete starter SaaS pages/nav/copy; OSEAD IA only
- [x] V2 Fair Housing + demo disclaimers
- [x] V3 ListingFilters Svelte island
- [x] V4 PropertyGallery Svelte island (+ video media support)
- [x] V5 Faux booking + check availability → contact
- [x] V6 Coastal weathered-wood design + brand-first homepage
- [x] V7 Expand seed inventory (≥12 homes)
- [x] V8 Contact/inquiry Function polish (rent/sale/booking intents)
- [x] V9 SEO collections (oceanfront, pets, large groups, elevators)
- [x] V10 Remove leftover starter surfaces + stabilize unit tests
- [x] V10b Daytime UX densify: O-sea-D brand, partner links, staff/about, distinct rent/sale inventory, footer dedupe

### Wave A leftovers — Listing UX

- [x] V11 Related properties on PDPs (3 same market or waterfront; no drafts) — backlog A3
- [x] V12 Wire Breadcrumbs on market + property pages (Home → … trail; optional BreadcrumbList JSON-LD) — backlog A4

### Wave B leftovers — SEO destinations

- [x] V13 Town pages under markets (`/markets/{market}/{town}` or flat `/towns/{town}`; SEO only, not primary nav) — backlog B2
- [x] V14 Three SEO journal posts (OBX oceanfront week; LBI buying; Delaware bayfront vs oceanfront) with internal links to markets/collections + ≥1 property each — backlog B3
- [x] V15 Programmatic sitemap priorities for PDPs, markets, collections, and towns — docs/PLAN.md Phase 2

### Wave C leftovers — Conversion

- [x] V16 Contact thank-you + honeypot (bot field ignored; success state; no new backend services) — backlog C2
- [x] V17 Inquiry rate-limit hardening in Pages Function (lightweight; document behavior) — docs/PLAN.md Phase 3

### Wave D leftovers — Template & media polish

- [x] V18 Replace SVG listing placeholders with license-safe coastal photo set (or clearly marked demo media) + meaningful alts — docs/PLAN.md Phase 1
- [x] V19 Market page full-bleed photography pass — docs/PLAN.md Phase 4
- [x] V20 Starlight docs: “White-label this template” section aligned with `docs/TEMPLATE.md` — docs/PLAN.md Phase 4
- [x] V21 TEMPLATE.md walkthrough test on throwaway config; document gaps in `docs/TEMPLATE.md` or `docs/afk/` — backlog D3

### Hygiene (before deploy)

- [x] V22 Lint debt: clear `pnpm lint` blockers (stylelint / `astro check` / remaining Analytics noise) so DoD gate is green — docs/PLAN.md Definition of done
- [x] V23 Playwright: install Chromium + bring e2e smoke suite green (or document skip with reason) — V10 leftover

## Next

- (empty — promote from Later only after Now is clear)

## Later

- [ ] Cloudflare Pages deploy checklist pass — **blocked until all Now items above are `[x]`**
- [ ] Optional email delivery (Resend / Mailchannels) **only if secrets present** — docs/PLAN.md Phase 3
- [ ] CollectionPage JSON-LD on `/collections/[slug]` (nice-to-have SEO)

## Explicit non-goals (unless requested)

- Full calendar booking + payments
- Live IDX/MLS sync
- Multi-tenant SaaS admin
- Native mobile apps

## Blocked

- (none)
