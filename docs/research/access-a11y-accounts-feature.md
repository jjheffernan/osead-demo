# Access, accessibility & scoped accounts — Wave J feature push

**Status:** Wave J UI built (J5–J8) · **CF deepen accepted** · Phase 5 scaffold (`docs/specs/cf-deepen.md`) — Functions/D1 wire-up still Later  
**Goal:** Raise **consumer + employee** accessibility of account surfaces, and deepen **scoped access** from `guest → agent → admin` so each role has a clear job, admin routes, and observability — without leaping to a full IdP/CMS until a deliberate backend decision lands.

**Extends (do not throw away):** Wave I — `DemoRole = admin | agent | guest`, `GuestHub` / `AgentDesk` / `AdminShell`, `guest-store`, `agent-assignments`, faux booking → `/contact`.

## Locked product intent

| Role | Who | Access surface | Observability (MVP) |
| --- | --- | --- | --- |
| `guest` | Consumer / client | Save homes, inquiries, **comments + ratings**, **verified-client badge** when earned | Own activity history; badge state visible to self |
| `agent` | Employee / realtor | **Own blog posts**, **edit own profile**, **listings attached to them**; inbox + market inventory (I9) | Own content + attached inventory pulse; no global analytics by default |
| `admin` | Brokerage ops | Full content/analytics + **moderation/visibility** over guest social + agent attachments | Global feed: ratings/comments, verified clients, anonymous listings, agent assignment health |

### Listing attribution modes

| Mode | PDP / cards show | Who can set |
| --- | --- | --- |
| `attributed` (default) | Assigned agent face + contact path | Admin (or agent self-attach within policy) |
| `anonymous` | **No staff profile** — brand-only contact CTAs | Admin only |

### Explicit non-goals (this wave)

- Live booking / payments / IDX
- Multi-tenant SaaS
- Replacing Wave I sessionStorage demo until backend decision (see companion research)
- New chart libraries or CMS deps in MVP slices

## Companion research

| Doc | Purpose |
| --- | --- |
| `docs/research/access-a11y-accounts-phases.md` | Long-form vertical phases MVP → implementation |
| `docs/research/backend-migration-cf-deepen.md` | Stay on Cloudflare stack, deepen storage/auth |
| `docs/research/backend-migration-baas.md` | BaaS options (Supabase / PocketBase-class) |
| `docs/research/backend-migration-hosted-idp.md` | Hosted IdP (Clerk / Auth.js) keep Astro |
| `docs/research/backend-migration-decision.md` | Pros/cons synthesis — **daylight decision** |

## Verify before done (any build slice)

`pnpm build` · `pnpm lint` (incl. `check:kpis`) · semantic tokens only · zero new deps unless a later phase explicitly unlocks one after the backend decision.
