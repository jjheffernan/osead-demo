# Acceptance matrix

Agents must not mark a ticket done unless the matching row passes.

| Ticket type | Required commands | Manual |
| --- | --- | --- |
| Content-only | `pnpm build` | Visit new URLs locally; unique title in `<title>` |
| Svelte island | `pnpm build` · autofixer clean | Keyboard + mobile viewport |
| Schema/SEO | `pnpm build` | View-source contains expected JSON-LD `@type` |
| Design tokens | `pnpm run check:kpis` · `pnpm run lint:css` | No new hex in components outside allowlist |
| Functions | Documented local invoke | No secrets committed |

## Global always-on checks

```bash
pnpm build
pnpm lint
```

If CI is unavailable overnight, local build+lint is the gate (`allowSkipTests: false` in after-hours config — ensure `testCommand` stays green).

## Content rules

- No `draft: true` properties linked from indexes
- Every property has ≥1 image with meaningful `alt`
- `listingType` matches CTAs shown
- Rentals with schema should include `checkInTime` / `checkOutTime` when claiming weekly rates
