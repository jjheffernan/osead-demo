# Backend migration — deepen Cloudflare (Pages Functions + bindings)

**Lane:** Stay on the existing Astro 7 → Svelte 5 → Cloudflare Pages stack. Prefer platform bindings over new npm deps.  
**Out of lane (companion docs only):** Supabase / PocketBase-class BaaS; Clerk / Auth.js hosted IdP as primary. Mentioned here only as “don’t jump there first.”  
**Companion:** `access-a11y-accounts-feature.md` (Wave J intent); decision synthesis lives in `backend-migration-decision.md`.

---

## 1. Current-state fit

### What Wave I already gives

| Piece | Where | Reality |
| --- | --- | --- |
| Roles | `src/lib/demo-account.ts` | `admin \| agent \| guest` + `canX()` gates |
| Session | `sessionStorage` (`osead-demo-account`) | Browser-only; editable in DevTools |
| Login / register | `functions/api/{login,register}.ts` | Shape + honeypot + isolate-local rate limit → `202`; **no user store** |
| Guest saves / inquiries | `src/lib/guest-store.ts` | `localStorage` mirror |
| Agent inventory | `src/config/agent-assignments.ts` + `staff.ts` | Static fixtures / market rotation |
| Shells | `GuestHub` / `AgentDesk` / `AdminShell` | Client-revealed on `/account` |
| Content mutate | `functions/api/content.ts` | Bearer `CONTENT_EDIT_SECRET` (+ optional GitHub Contents) |
| Media | `wrangler.jsonc` → `R2_MEDIA` | Cleanup Function already R2-aware |
| Analytics feed | `functions/api/admin-analytics.json.ts` | Demo JSON; no auth/KV/D1 |

Site stays **static Astro**; Functions are edge handlers, not Astro SSR. No D1/KV bindings today.

### Gaps for Wave J

Wave J needs **shared, server-visible state** that Wave I deliberately avoided:

- Guest **comments + ratings** visible to others + admin moderation
- **Verified-client badge** that isn’t self-granted via DevTools
- Agent **own blog posts**, **profile edit**, **listing attach** (beyond static rotation)
- Listing **`anonymous` vs attributed** mode (admin-set)
- Admin **moderation queue + light observability** across guests/agents/listings

None of that works as a product demo if it only lives in one browser’s `localStorage`. Deepening CF means adding a small persistence + session seam **without** leaving Pages.

---

## 2. Concrete CF building blocks (Wave J map)

Ponytail default: **one D1 database + cookie sessions in Pages Functions**. Use KV/R2/DO only where D1 is the wrong shape.

| Need | Prefer | Shape / notes |
| --- | --- | --- |
| **Sessions** | HttpOnly `Set-Cookie` from login/register Functions + **D1 `sessions`** (or KV `session:<id>` if you want TTL eviction without SQL) | Replace `writeDemoAccount` *implementation*; keep the same read API at call sites. Server Functions that mutate must check cookie → session → role. **Not** Workers Auth for MVP (extra product surface). |
| **Comments / ratings** | **D1** tables: `reviews(id, property_slug, author_email, body, rating, status, created_at)` | `status`: `pending \| published \| hidden`. Indexed by `property_slug` + `status`. Pages Function CRUD; guest can POST own; admin PATCH status. |
| **Verified badge** | **D1** `guests.verified_at` (nullable) set **only** by admin Function | Client may *display* badge from session claim, but grant is server-side. Rule stub: e.g. ≥1 published review + admin flip (policy later). |
| **Agent profile** | Keep `staff.ts` / About as **seed**; D1 `agent_profiles` overlay (`bio`, `phone`, `headshot_key`) keyed by `staff_id` | Profile edit = Function UPSERT scoped to session `staff_id` / email allowlist. Headshots → existing **R2** (`uploads/agents/…`). |
| **Listing ↔ agent attach** | D1 `listing_agents(property_slug, staff_id, attached_at)` **or** frontmatter `agentId` + D1 override row | Admin (or agent self-attach within policy) mutates via Function. Build-time Markdown stays canonical for SEO pages; runtime overlay for desk + PDP “who to contact.” |
| **Anonymous flag** | D1 `listing_visibility(property_slug, mode)` where `mode = attributed \| anonymous` | Admin-only write. PDP/cards: if anonymous → brand CTAs, hide staff face (Wave J table). |
| **Admin audit / observability** | **MVP:** D1 `audit_log(actor, action, target, at, meta_json)` written by mutating Functions + `console.log` (already used on login) | **Later:** Workers Analytics Engine for counters; Logpush if ops care. Skip full APM. |

**Skip for this demo unless forced:** Durable Objects (coordination tax), Queues, Hyperdrive, Vectorize, full Workers → Pages migration.

**Rate limits:** keep isolate `Map` for demo; upgrade path already documented (`contact-rate-limit.md`) → CF Rate Limiting rules or KV counter — not DO.

---

## 3. MVP vs later (CF only)

### MVP (smallest deepen that unblocks Wave J demos)

1. Bind **one D1** in `wrangler.jsonc`; migrations for `sessions`, `reviews`, `guests`/`agent_profiles`, `listing_agents`, `listing_visibility`, `audit_log`.
2. Harden login/register to mint **signed session cookie** (HMAC secret in Pages secrets) + D1 session row; `demo-account.ts` becomes thin client cache *or* drops to “fetch `/api/me`.”
3. Functions: `POST/GET reviews`, `PATCH reviews/:id` (admin), `PATCH guests/:id/verified` (admin), agent profile UPSERT, listing attach + anonymous flag.
4. AdminShell: moderation list + audit tail (last N rows). GuestHub: own reviews + badge. AgentDesk: profile form + attached listings (read D1, not only static map).
5. Keep **blog Markdown** + existing content Function for agent posts (scope by path/author in frontmatter). Do **not** move the blog into D1 in MVP.

### Later (still CF)

- Shared rate-limit KV / platform Rate Limiting
- R2 avatars + signed upload URLs
- Workers Analytics Engine dashboards for review volume / hide rate
- Cloudflare Access in front of `/account` admin paths (ops SSO) — optional, not guest auth
- Cookie session rotation, CSRF on cookie POSTs, password hash table if you outgrow demo creds
- Only then consider **Workers Auth** / OAuth providers if daylight rejects “HMAC cookie + D1”

---

## 4. Cost / ops / complexity ceiling & offline

| Dimension | Ceiling |
| --- | --- |
| **Cost** | Demo traffic stays inside CF free/low paid envelopes (D1 + Pages Functions + existing R2). No per-MAU IdP bill. |
| **Ops** | One more binding + migrations + secrets (`SESSION_SECRET`, keep `CONTENT_EDIT_SECRET`). Schema drift becomes a real concern — keep migrations tiny. |
| **Complexity** | Medium: leave static Astro, add ~5–8 Functions and a SQL schema. Avoids second cloud (BaaS) and Auth SaaS. |
| **Local / offline** | Pure static click-through **breaks** for reviews/badge/attach unless `wrangler pages dev` (or equivalent) runs with **local D1**. AFK agents must document “needs bindings” vs client-only Wave I. Seed SQL for demo roles so login still works offline *with* wrangler. Without wrangler: sessionStorage fallback is a **display-only** lie — label it. |

---

## 5. Security note

**Demo gating ≠ server enforcement.** Today anyone can set `sessionStorage` to `role: "admin"` and reveal AdminShell; login Functions do not issue a trusted credential. Deepening CF only helps if **mutating** routes refuse requests without a verified cookie/session row and role check. UI `hidden` attributes and `canX()` remain UX, not ACLs. Never treat published reviews, verified badges, or anonymous listing flips as safe until Functions enforce them. Content editor’s bearer secret is a separate ops secret — don’t conflate it with end-user sessions.

---

## 6. Recommendation score

**Stay + deepen CF for this repo’s demo goals: 4 / 5**

Why not 5: Wave J *can* still ship UI with seeded/client mocks until a daylight backend decision; D1+cookies is the right *platform* deepen but is the first real ops step (migrations, local bindings). Why not ≤3: you already deploy Pages Functions + R2; D1 is the lazy persistence rung that matches AGENTS.md “keep backend light” better than bolting on out-of-lane BaaS/IdP as primary.

---

## 7. Do not build yet

- Durable Objects / Queues / Hyperdrive / full SSR Astro adapter “because auth”
- Workers Auth / OAuth / magic links as MVP
- Moving blog or property Markdown collections into D1
- Password-hash user directory + email verification flows
- Multi-tenant brokerage SaaS schema
- Real-time websockets / DO chat for comments
- Analytics Engine, Logpush, or BI embeds before a moderation list exists
- Replacing `guest-store` saved-homes with D1 on day one (local mirror is fine until cross-device matters)
- Any Supabase/Clerk wiring in this lane (companions cover those)

---

## Ponytail summary

**Reuse** Wave I seams (`demo-account` I/O, shells, static seeds). **Add** D1 + cookie sessions + a handful of Functions. **Defer** Auth products, DO, and CMS. Daylight picks this lane vs BaaS/IdP in `backend-migration-decision.md` before overnight build slices touch bindings.
