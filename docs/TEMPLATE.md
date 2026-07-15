# White-label this template

1. Fork / copy repo.
2. Update `src/config/site.config.ts` — `url`, `name`, `description`, `author`, `email`, socials, branding colors.
3. Update `src/config/nav.config.ts` if IA changes.
4. Replace logos in `public/logos/` and `public/favicon.svg`.
5. Set `SITE_URL` in `.env` (from `.env.example`).
6. Rename Cloudflare project in `wrangler.jsonc` (`name`, R2 bucket if used).
7. Replace `src/content/properties/*.md` and `src/content/markets/*.md`.
8. Rewrite homepage copy in `src/pages/index.astro` + `src/i18n/en.json`.
9. Update Starlight `editLink` / social in `astro.config.ts`.
10. `pnpm install && pnpm build`
11. Deploy: Cloudflare Pages → build `pnpm build`, output `dist`.

Optional: remove unused starter pages (`/services`, `/pricing`, showcase) once redirects or nav no longer reference them.
