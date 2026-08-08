# Cloudflare deepen — Phase 5 schema (accepted path)

**Decision:** `docs/research/backend-migration-decision.md` (accepted 2026-08-08)  
**UI seam today:** `src/lib/social-store.ts`, `guest-store.ts`, `demo-account.ts` (localStorage / sessionStorage)  
**Goal:** replace those stores with D1 + HttpOnly cookie sessions in Pages Functions without changing call-site shapes.

## Bindings (when wired)

| Binding | Use |
| --- | --- |
| `DB` (D1) | comments, ratings, verified_clients, agent_profile_overrides, sessions |
| env `SESSION_SECRET` | Sign session cookies |

Static Astro build stays default. Functions enforce role on mutating routes.

## SQL sketch (`migrations/0001_cf_deepen.sql`)

See that file. Tables mirror the demo stores:

- `sessions(id, email, role, name, expires_at)`
- `comments(id, target_type, target_id, body, author_name, author_email, created_at)`
- `ratings(id, target_type, target_id, rating, author_name, author_email, quote, created_at)`
- `verified_clients(email PRIMARY KEY, verified_at)`
- `agent_profiles(email PRIMARY KEY, display_name, role_title, bio, updated_at)`

## Upgrade order

1. Cookie login beside existing demo login (dual-read)
2. Move social mutations to Functions + D1
3. Drop localStorage writes when `PUBLIC_SOCIAL_API=1`
4. Keep Markdown properties/blog as SEO SoT (`agentId` / `attribution` frontmatter stays)

## Do not

- Move listings/blog bodies into D1
- Add Clerk/Supabase/PocketBase
- Break offline demo: without D1 binding, UI keeps local stores
