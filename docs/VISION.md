# Site vision (locked)

Product source of truth for AFK agents. Do not reopen overnight unless the operator edits this file.

## Audience & product

1. **Primary:** portfolio demo.
2. **Secondary:** white-label product template others can spin up quickly.
3. **Brand:** keep **OSEAD** (O-sea-d). No rename required.

## Experience priorities

1. Homepage is a **50/50** rent + buy split, optimized for **customer experience** (clear paths, not dashboards).
2. **Rentals are primary** in presentation; sales are first-class “buy this home” / dual inventory.
3. Inventory feel: **large PMC** — strong filters, scale-implying IA, not boutique 8-home brochure only.
4. **Do not center market geography** as the main IA. Markets can exist for SEO/depth, but primary browse is filters + inventory, not “pick OBX vs Jersey first.”
5. Conversion: **faux booking + check availability → contact** (no live payments required for demo).

## Design

1. Centered, intentional coastal look; weathered wood / beach textures are welcome.
2. **Never look like Zillow or Airbnb** — no MLS-grid commodity chrome, no OTA marketplace clutter, no map-first listing search clones, no “similar homes carousel” spam aesthetics.
3. Brand first on branded surfaces; photography-forward; avoid tourist cliché seashell kitsch and generic purple AI gradients.

## Legal / trust

1. Always show:
   - Equal Housing / Fair Housing language where listings appear.
   - Clear **demo disclaimer**: sample inventory, not live offers / not a real brokerage transaction.
2. Contact / booking CTAs must not imply a confirmed paid reservation.

## Scope for overnight builds

1. **Delete starter cruft** (`/services`, `/pricing`, showcase leftovers, leftover SaaS marketing copy) and build OSEAD paths.
2. Scope is otherwise **open** — limit only by **drift** and the spin-up rule below.
3. **Hard constraint:** stay lightweight enough to spin a demo quickly (static Markdown inventory, Svelte islands, Cloudflare Pages, light Functions). No mandatory CMS/DB/IDX.
4. Goal: **shippable product**, full steam ahead.

## Operator workflow (AFK)

1. Prefer **subagents** for work; one vertical slice = one subagent **conception → integration**.
2. Commit **granularly**; push often when network/auth allows.
3. **GitHub PR creation is HITL-gated** — do **not** hang waiting for PR permissions.
4. Default outcome: **local branch → local merge to `main` → push `main`** (or push the branch). Skip `gh pr create` unless explicitly asked.
5. Treat “max PRs” as **max completed local slices** when PRs are unavailable.

## Loop controls (this arm)

| Control | Value |
| --- | --- |
| Tick interval | 10m |
| Max completed slices | 10 |
| Hard stop | 10 hours from `startedAt` if operator does not stop earlier |

## Open (non-blocking)

- Demo host URL can stay `osead-demo.pages.dev` until deploy.
- Faux booking may use week-picker / mocked blocked dates that always escalate to contact.
