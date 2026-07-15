# TEMPLATE.md walkthrough evidence (V21)

**Branch:** `after-hours/v21-template-walkthrough`  
**Base:** `main` @ `4d12a90`  
**Mode:** dry-run / path verification (no throwaway customer branding committed)

Goal: execute each `docs/TEMPLATE.md` step against the repo; record pass/fail and gaps. Permanent branding/secrets stay on the demo path.

## Step results

| # | Step | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Fork / copy repo | N/A (process) | — |
| 2 | Update `src/config/site.config.ts` | **PASS** (keys) | File exists. Keys: `url`, `name`, `description`, `author`, `email`, **`socialLinks`** (not `socials`), `branding.colors`. Also `branding.logo`, `ogImage`, `authorImage`, verification — undocumented in TEMPLATE. |
| 3 | Update `src/config/nav.config.ts` | **PASS** | File exists; `mainNav` / `footerNav`. |
| 4 | Replace logos in `public/logos/` + `public/favicon.svg` | **GAP** | `public/favicon.svg` exists. **`public/logos/` does not exist.** Config points at `/logos/logo-light.svg` + `/logos/logo-dark.svg` (JSON-LD via `buildOrganizationSchema`). Header `Logo.astro` is text monogram — no SVG load. |
| 5 | Set `SITE_URL` in `.env` from `.env.example` | **PASS** | `.env.example` documents `SITE_URL=`. Astro `env.schema` defaults localhost. Canonical/OG also use `siteConfig.url` (dual source). |
| 6 | Rename Cloudflare project in `wrangler.jsonc` | **PASS** | `name: "osead-demo"`, `r2_buckets[0].bucket_name: "osead-media"`, `pages_build_output_dir: "./dist"`. |
| 7 | Replace `properties/*.md` + `markets/*.md` | **PASS** (paths) | Both dirs present (18 properties, 3 markets). Contract: `docs/specs/property-content.md`. **Missed in TEMPLATE:** `collections/`, `blog/`, `pages/`, `authors/`, `settings.yml`. |
| 8 | Rewrite homepage `index.astro` + `en.json` | **PASS** | Both paths exist. |
| 9 | Starlight `editLink` / `social` in `astro.config.ts` | **PASS** | `editLink.baseUrl` + `social[]` under `starlight({...})`. |
| 10 | `pnpm install && pnpm build` | **PASS** | Build verified on committed tree (see PR/branch CI or local run). |
| 11 | Deploy Cloudflare Pages | **SKIP** (gated) | After-hours: no deploy. Starlight guide notes deploy gated until TODO Now clear; TEMPLATE step 11 does not. |

### Redirects footnote

`public/_redirects` present:

- `/services`, `/services/*`, `/pricing`, `/sections`, `/sections/*` → `/` (301)
- `/pages` → `/about` (301) — not listed in TEMPLATE footnote

### Dual config (not in TEMPLATE)

| Source | Role |
| --- | --- |
| `src/config/site.config.ts` | Primary brand / SEO / social / colors |
| `src/content/settings.yml` | Contact email/org, map lat/lng, analytics provider IDs |

Touching only `site.config.ts` leaves contact/analytics/map on demo values.

## Throwaway config policy

Did **not** mutate `site.config.ts` / `.env` / wrangler with fake customer branding. Path + key verification + build on the demo tree is sufficient for V21; avoids secrets/branding leaking onto mergeable commits.

## Gaps filed into docs

Surgical fixes applied to `docs/TEMPLATE.md` (and Starlight mirror key mismatches). This file is the evidence ledger.
