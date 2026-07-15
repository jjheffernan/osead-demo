# OSEAD Demo

High-end **coastal real estate template** for weekly beach rentals and second-home sales (Outer Banks, Jersey Shore, Delaware Beaches). Built from [astro-cloudflare-starter](https://github.com/milzamsz/astro-cloudflare-starter) with **Astro + Svelte islands + Cloudflare Pages**.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321.

## Stack

- Astro 7 static site
- Svelte 5 islands (filters/gallery planned)
- Tailwind v4 + design tokens
- Cloudflare Pages (+ optional R2 / Functions)
- Markdown content collections for properties & markets
- SEO: sitemap, canonical, OG, VacationRental + RealEstateListing JSON-LD

## Docs for humans & AFK agents

| Doc | Purpose |
| --- | --- |
| [docs/PLAN.md](./docs/PLAN.md) | Phased build plan |
| [docs/research/coastal-luxury-patterns.md](./docs/research/coastal-luxury-patterns.md) | Competitive + SEO research |
| [docs/afk/README.md](./docs/afk/README.md) | After-hours arming guide |
| [docs/TEMPLATE.md](./docs/TEMPLATE.md) | White-label checklist |
| [TODO.md](./TODO.md) | Agent queue (`todo-md` Source) |

## Agent skills installed

- [heff-skills](https://github.com/jjheffernan/heff-skills) — `/after-hours`
- [caveman](https://github.com/JuliusBrussee/caveman)
- [ponytail](https://github.com/DietrichGebert/ponytail)

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
```

## License

MIT (starter heritage + this fork).
