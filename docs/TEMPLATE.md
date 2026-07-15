# White-label this template

1. Fork / copy repo.
2. Update `src/config/site.config.ts` — `url`, `name`, `description`, `author`, `email`, `socialLinks`, `branding.colors` (and `branding.logo` / `ogImage` / `authorImage` if you use them).
3. Mirror org name / email / map / analytics in `src/content/settings.yml` (contact page + Analytics island read this; do not update only `site.config.ts`).
4. Update `src/config/nav.config.ts` if IA changes.
5. Replace `public/favicon.svg`. Optional: add SVGs under `public/logos/` matching `branding.logo.light` / `.dark` (JSON-LD Organization logo). Header brand is currently a text monogram in `Logo.astro`, not those files.
6. Set `SITE_URL` in `.env` (from `.env.example`). Keep it aligned with `siteConfig.url` for production.
7. Rename Cloudflare project in `wrangler.jsonc` (`name`, R2 `bucket_name` if used). Output dir is already `pages_build_output_dir: "./dist"`.
8. Replace inventory Markdown:
   - `src/content/properties/*.md` — field contract: `docs/specs/property-content.md`
   - `src/content/markets/*.md`
   - Also replace demo `collections/`, `blog/`, `pages/`, and `authors/` as needed
9. Rewrite homepage copy in `src/pages/index.astro` + `src/i18n/en.json`.
10. Update Starlight `editLink` / `social` in `astro.config.ts`.
11. `pnpm install && pnpm build`
12. Deploy (gated): Cloudflare Pages → build `pnpm build`, output `dist`. Prefer waiting until TODO.md **Now** hygiene is clear (see Starlight [Cloudflare Pages](/docs/deployment/cloudflare-pages/) guide).

Starter SaaS routes (`/services`, `/pricing`, `/sections`) and legacy `/pages` redirect via `public/_redirects` (`/pages` → `/about`).

Walkthrough evidence (V21): `docs/afk/template-walkthrough.md`.
