---
title: White-label this template
description: Rebrand OSEAD for your market — config, inventory, and Pages deploy prep.
sidebar:
  order: 0
---

Canonical checklist lives in the repo at [`docs/TEMPLATE.md`](https://github.com/jjheffernan/osead-demo/blob/main/docs/TEMPLATE.md). This page mirrors those steps for `/docs`.

## Brand and config

1. Fork or copy the repo.
2. Update `src/config/site.config.ts` — `url`, `name`, `description`, `author`, `email`, `socialLinks`, `branding.colors` (plus `branding.logo` / `ogImage` / `authorImage` if used).
3. Mirror org name / email / map / analytics in `src/content/settings.yml`.
4. Update `src/config/nav.config.ts` if information architecture changes.
5. Replace `public/favicon.svg`. Optional: add `public/logos/` SVGs matching `branding.logo` (JSON-LD); header brand is a text monogram today.
6. Set `SITE_URL` in `.env` (copy from `.env.example`); keep aligned with `siteConfig.url`.
7. Rename the Cloudflare project in `wrangler.jsonc` (`name`, and R2 `bucket_name` if used).
8. Rewrite homepage copy in `src/pages/index.astro` and `src/i18n/en.json`.
9. Update Starlight `editLink` / `social` in `astro.config.ts`.

See also [Customization](/docs/guides/customization/) and [Environment Variables](/docs/deployment/environment-variables/).

## Inventory

Replace demo Markdown collections:

- `src/content/properties/*.md` — listings (rentals + sales)
- `src/content/markets/*.md` — town / market landings
- Also as needed: `collections/`, `blog/`, `pages/`, `authors/`

Field contracts: `docs/specs/property-content.md`. Content workflow notes: [Content Management](/docs/guides/content-management/).

Legacy SaaS starter routes (`/services`, `/pricing`, `/sections`) and `/pages` → `/about` already redirect via `public/_redirects` — leave them or delete after your IA is settled.

Walkthrough evidence: `docs/afk/template-walkthrough.md`.

## Build locally

```bash
pnpm install && pnpm build
```

Output directory: `dist`.

## Cloudflare Pages — prepare only

Pages target: build command `pnpm build`, output `dist`. Full steps: [Cloudflare Pages](/docs/deployment/cloudflare-pages/).

**Deploy is gated.** Do not push production deploys until **TODO.md → Now** is clear (hygiene items such as lint / e2e green). Prep wrangler name, secrets, and `SITE_URL` now; ship later.
