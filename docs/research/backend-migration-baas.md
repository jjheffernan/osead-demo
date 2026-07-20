# Backend migration — BaaS class (Supabase / PocketBase)

**Lane:** BaaS-class Auth + DB + RLS/rules only. Companion to `access-a11y-accounts-feature.md` (Wave J).  
**Stack today:** Astro 7 SSG + Svelte 5 islands + Cloudflare Pages Functions; Markdown collections; `sessionStorage` demo auth (`admin|agent|guest`).  
**North star:** fork → brand + seed → deploy Pages **without** standing up a DB/CMS (`docs/PLAN.md`).

## TL;DR

BaaS fits Wave J **UGC** (comments, ratings, verified badge, moderation) better than stuffing that into Git Markdown. It fits **SEO inventory** poorly — keep `properties` / `blog` / `markets` as collections. For *this* demo template, adopt **neither** until a daylight decision: score **2/5**. If forced later, prefer **PocketBase** (single binary, demo-offline) over **Supabase** (hosted Postgres + RLS, more CF friction).

| | Supabase | PocketBase | Firebase / Appwrite (brief) |
| --- | --- | --- | --- |
| Auth + roles | JWT + `app_metadata` / custom claims; Postgres RLS | Auth collections + API rules | Firebase: Auth + Security Rules; Appwrite: teams/roles |
| DB | Hosted Postgres | Embedded SQLite (Go binary) | Firestore / Appwrite DB |
| CF Pages | Client SDK OK; `@supabase/ssr` wants Nodes/Workers + `nodejs_compat` | Client SDK OK; PB runs **off** CF (VPS/Fly/local) | Similar remote-API pattern; Firebase heavier SDK |
| Demo-offline | Needs project or local Docker stack | `./pocketbase serve` on laptop | Weakest offline story |
| Lock-in | Medium (Postgres portable; Auth/Realtime less so) | Low (SQLite file + OpenAPI) | High (Firebase) / medium (Appwrite) |

---

## 1. Fit vs Markdown content model

**Keep in Git (SSG):** `properties`, `markets`, `collections`, `blog`, seed `testimonials`, staff bios (`src/config/staff.ts`). These drive SEO, sitemap, JSON-LD, and the template fork story.

**Move to BaaS (or stay demo-local):** anything that must be **written by browsers** and **moderated** across users:

| Wave J object | Join key | Notes |
| --- | --- | --- |
| Comments / ratings | `property_slug` / `staff_id` / `business_id` (same as testimonials) | Do **not** commit live UGC into `src/content/` |
| Verified-client badge | `user_id` + criteria flag | Server-owned; not frontmatter |
| Agent profile extras | `agent_id` ↔ `staff.id` | Bio edit = BaaS row; About page still SSG from seed until publish |
| Agent blog | Prefer keep Markdown OR draft in BaaS → export to MD | SSG wins SEO; live CMS blog fights the north star |
| Listing attribution | `attribution: attributed\|anonymous` + optional `agent_id` | Can stay frontmatter; BaaS only if agents mutate at runtime |
| Anonymous listings | Same slug space as MD | Flag on property record or frontmatter; PDP hides staff card |

**Coexistence pattern:** SSG pages embed islands that `fetch` BaaS by **slug**. Seed ratings stay Markdown until a real write path exists (`site.config` already has `comments.enabled: false`).

---

## 2. Migration shape

| Shape | What changes | When |
| --- | --- | --- |
| **A. SSG + client SDK (recommended if BaaS)** | Keep `output: static`; islands talk to BaaS; Pages Functions stay thin (or proxy) | Matches today; no Astro adapter |
| **B. Hybrid Astro** | `output: "hybrid"` + `@astrojs/cloudflare` for cookie/SSR auth routes | Only if you need HttpOnly session on every HTML request |
| **C. Full content CMS in BaaS** | Properties leave Markdown | **Reject** for this template |

Seam already exists: rewrite insides of `readDemoAccount` / `writeDemoAccount` / `canX` (`demo-account.ts`); call sites stay. Login/register Functions already return `{ name, email, role }` — swap echo for BaaS token exchange.

---

## 3. Role / RBAC mapping

Map `DemoRole` → BaaS identity; **enforce on the server** (RLS / API rules). Client `canX` stays UX only.

| Role | Supabase (sketch) | PocketBase (sketch) |
| --- | --- | --- |
| `guest` | `auth.users` + `profiles.role = 'guest'`; RLS: CRUD own comments/ratings; read approved | `users` + `role` field; create rule: `@request.auth.id = user`; list: `status = 'approved' \|\| user = @request.auth.id` |
| `agent` | `role = 'agent'`; update own profile; read assigned inquiries; optional draft posts | Same + rules on `agent_id = @request.auth.id` |
| `admin` | `role = 'admin'` bypass / `service_role` only in Functions | Admin UI + superuser; or `role = 'admin'` rules on all collections |
| Verified badge | `profiles.verified_at` set by admin trigger / Function after N approved ratings or staff mark | Admin-only update rule on `verified` |
| Anonymous listing | `properties_meta.attribution`; agents cannot clear anonymity unless policy says so | Field + update rule: admin only for `anonymous` |

**Attribution:** anonymous = hide staff on PDP/cards; inquiries still route brand `/contact`. Do not invent a fourth public role — anonymity is a **listing flag**, not an account type.

---

## 4. Observability / admin surfaces

| Need | Free / built-in | Build yourself |
| --- | --- | --- |
| User list, role edit | Supabase Auth + Studio; PB Admin UI | Wire into `AdminShell` (optional deep-link) |
| Moderation queue | Table + filters in Studio/PB | In-app feed (Wave J admin MVP) |
| Audit (“who approved”) | Supabase: optional logging/extensions; PB: limited | `moderated_by`, `moderated_at` columns |
| Analytics dashboards | Neither is Looker | Keep first-party `admin-analytics` seed / Functions |
| Alerts / rate limits | Edge Function / PB hooks | Existing Pages Function rate-limit pattern |

BaaS gives **data admin** for free; **brokerage-shaped** observability (assignment health, anonymous listing pulse) is still custom UI on top of queries.

---

## 5. Cloudflare Pages deploy friction

| Concern | Supabase | PocketBase |
| --- | --- | --- |
| SSR needed? | **No** for client-only UGC; **yes**/hybrid if cookie SSR via `@supabase/ssr` | **No** for client SDK; PB not deployable *on* Pages |
| Secrets | `PUBLIC_SUPABASE_URL`, anon key (public); service role **only** in Functions, never islands | `PUBLIC_PB_URL`; admin creds never in client |
| Edge | `@supabase/supabase-js` fine from islands/Functions; SSR helper historically needs Workers `nodejs_compat` | Fetch to external origin; CORS + cookie domain planning |
| Extra infra | Hosted project (or self-host stack) | Always a **second** host (Fly, Railway, VPS, `localhost`) |

Today’s repo has **no** Astro adapter — path A preserves that. Path B is a separate infra ticket, not a BaaS freebie.

---

## 6. Cost / lock-in / complexity / demo-offline

| | Supabase | PocketBase |
| --- | --- | --- |
| Cost | Free tier then usage; per-fork project tax for template users | Free software; you pay host (~$0–5+/mo) |
| Lock-in | Auth+Realtime stickier than SQL dump | SQLite file portable; API rules are PB-specific |
| Complexity | RLS is powerful and easy to get wrong | Rules simpler; ops = keep binary alive + backups |
| Demo-offline | Weak without Docker Compose | **Strong:** binary + `pb_data/` in gitignore |
| Template fork | Every white-label needs a project + env | Every deploy needs a PB URL — still breaks “no DB” north star |

**Demo-offline story without BaaS (preferred now):** keep Wave I sessionStorage + localStorage / seed Markdown; feature-flag live comments (`comments.enabled`).

---

## 7. Recommendation score (this demo)

**BaaS for OSEAD demo Wave J: 2 / 5**

- **+** Correct home for multi-user comments, ratings, verified badge, moderation.
- **−** Violates “deploy without a database” north star and AGENTS.md light-backend rule.
- **−** Adds secrets, CORS, and a second system to AFK/fork workflows.
- **−** Markdown SEO model should not move into BaaS.
- **If later:** PocketBase first for local demos; Supabase when a real brokerage wants hosted Postgres + RLS and accepts SaaS.

Defer implementation until `backend-migration-decision.md` picks a lane (CF-deepen vs BaaS vs hosted IdP).

---

## 8. Explicit non-goals / do not build yet

- Do **not** install `@supabase/*`, `pocketbase`, Firebase, or Appwrite SDKs this wave.
- Do **not** flip Astro to `server`/`hybrid` solely to “enable BaaS.”
- Do **not** migrate `properties` / `blog` / `markets` out of Markdown collections.
- Do **not** replace `sessionStorage` demo auth until the daylight backend decision.
- Do **not** build multi-tenant SaaS, live booking/payments, IDX, or a second admin console that duplicates Studio/PB Admin.
- Do **not** put `service_role` / PB superuser tokens in Svelte islands or `PUBLIC_*` env.
- Wave J MVP social: seed + client demo stores + admin *UI shells* that read fixtures — real persistence waits on the decision doc.
