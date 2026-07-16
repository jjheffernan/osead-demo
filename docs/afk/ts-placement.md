# TypeScript placement (S24)

Authoring order: **Astro → Svelte 5 → TypeScript**. This note records what must stay `.ts`, what moved in S24, and what stays deferred.

## Must-keep as `.ts`

| Area | Why |
| --- | --- |
| `src/content.config.ts` | Zod / collection schemas |
| `src/config/*` | Brand, nav, staff, marketplace input |
| `src/lib/site-config.ts` | `Locale` + `SITE_CONFIG` shared by Astro + Svelte |
| `src/lib/seo.ts` | Canonical / OG / JSON-LD (Astro SEO) |
| `src/lib/images.ts` | Img presets / R2 helpers |
| `src/lib/property-schema.ts` | Listing JSON-LD builders |
| `src/lib/properties.ts` | Collection queries + card serialization for pages |
| `src/lib/blog.ts` | Blog summaries + related-post scoring (Astro layouts) |
| `src/lib/cn.ts` | Shared by Astro *and* Svelte UI — not Svelte-only |
| `src/i18n/routes.ts`, `src/i18n/ui.ts` | Shared routing / `t()` across Astro + Svelte |
| `src/pages/*.ts` | Endpoints (`rss`, `robots`, `og`, `llms`) |
| `functions/api/*` | Cloudflare Pages Functions |
| `src/__tests__/**`, `src/test/**` | Vitest / Playwright |
| `astro.config.ts`, `vitest.config.ts`, `playwright.config.ts` | Tooling |
| `src/env.d.ts`, `src/types/*.d.ts` | Ambient types |

Astro pages, layouts, `SEO`, `Img`, `Icon`, and design-kit Astro primitives stay Astro — do not delete them to chase language %.

## Moved (S24)

| From | To | Why |
| --- | --- | --- |
| `src/i18n/switcher.ts` | `src/components/layout/get-equivalent-path.svelte.ts` | Only consumer is `LanguageSwitcher.svelte`; drop unused `hasEquivalent` + redundant route map |
| `slugify` in `src/lib/utils.ts` | `src/lib/properties.ts` | Only production callers were property/town path builders + town `getStaticPaths` |
| Rest of `src/lib/utils.ts` | deleted | `formatDate` / `truncate` / `capitalize` / `groupBy` / `calcReadingTime` had no production callers (tests-only) |

## Deferred (keep `.ts` for now)

| Item | Why deferred |
| --- | --- |
| `BlogPostSummary` / `PropertyCardData` in `lib/` | Astro creates these shapes; Svelte only types props — moving types into `.svelte.ts` would force Astro lib → Svelte module imports for little gain |
| `src/lib/cn.ts` path | Shared Astro + Svelte; colocating under `components/ui/` is rename churn only |
| TagList local `slugify` | Simpler blog-tag variant; leave until tags need NFKD parity with town slugs |
| Design-kit Astro UI still using `cn` | Keep Astro; convert only when a ticket asks for Svelte SSR UI |

## Check

`pnpm build` green after the moves above.
