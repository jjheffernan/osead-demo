# Backend migration — decision synthesis (Wave J)

**Status:** Research synthesis (Phase 0) — **not** an implementation ticket  
**Inputs:** `backend-migration-cf-deepen.md` · `backend-migration-baas.md` · `backend-migration-hosted-idp.md`  
**Product SoT:** `access-a11y-accounts-feature.md` · phases: `access-a11y-accounts-phases.md`  
**Hard constraints (AGENTS.md):** Cloudflare Pages preserved · backend stays light · Markdown SEO inventory · ponytail (reuse → native → minimal new code) · no overnight migrate without daylight accept

---

## 1. Executive recommendation

**Default path: stay on Cloudflare Pages and deepen it (D1 + HttpOnly cookie sessions + a handful of Pages Functions) when Phase 5 hardening is authorized.** Keep Markdown collections as the SEO/content source of truth; keep Wave I `demo-account` / `canX()` as the UI seam through Phases 1–4 (demo-local stores only). Do **not** adopt BaaS or a hosted IdP as the next step — both score poorly against the template north star (fork → brand → deploy Pages without standing up a DB/CMS) and against Astro-static + AFK/offline realities. If daylight later rejects CF deepen, prefer PocketBase over Supabase; reopen hosted IdP only after accepting an SSR/Workers deploy-shape change.

**Preference order**

1. **CF deepen** (D1 + cookie sessions + Functions) — default for Phase 5  
2. **BaaS — PocketBase first** (only if daylight wants a second host + Admin UI and rejects CF SQL)  
3. **BaaS — Supabase** (only if a real brokerage wants hosted Postgres + RLS and accepts CF/SSR friction)  
4. **Hosted IdP** (Clerk / Auth.js) — last; pairs with thin D1 anyway, and forces adapter + deploy-shape tax  

---

## 2. Pros / cons comparison

| Dimension | CF deepen | BaaS | Hosted IdP |
| --- | --- | --- | --- |
| **What it buys** | Persistence + server-checked sessions on the stack you already deploy | Auth + DB + Studio/Admin UI + RLS/rules for UGC | Real identity, sessions, role claims, user directory |
| **What it does *not* buy** | Hosted user admin UI; OAuth polish | SEO inventory (must stay Markdown); “no DB” fork story | Comments/ratings store; listing ownership; Markdown bodies |
| **Fit to AGENTS / PLAN** | Best — Pages + light bindings; no second cloud | Weak — violates “deploy without a database” north star | Weak — SSR/adapter move + SaaS per fork |
| **Deploy shape** | Stay static Astro + Pages Functions; add D1 binding | Client SDK OK (path A); PB always off-CF; Supabase SSR wants Workers/`nodejs_compat` | Forces hybrid/server + `@astrojs/cloudflare` (Workers, not classic static Pages) |
| **Wave J social (comments, badge, mod)** | Natural home in D1 tables | Natural home in BaaS tables | Needs a **second** thin store (D1/KV) anyway |
| **Roles / RBAC** | Cookie session → role checks in mutating Functions | RLS / API rules mirror `canX()` | Claims → `DemoRole`; enforce in middleware + Functions |
| **Cost (demo)** | Inside CF free/low envelopes | Supabase free→usage + per-fork project; PB = host bill | Clerk free→paid; Auth.js free code, ops time |
| **Ops / secrets** | `SESSION_SECRET` + migrations; schema drift risk | URL + anon/service keys; CORS; second system | IdP dashboard + secrets + likely D1 session adapter |
| **Demo / AFK offline** | Needs `wrangler pages dev` + local D1; without it, client fallback is display-only | PB strong (`./pocketbase serve`); Supabase weak without Docker | Weak — seeded users / bypass fights template forks |
| **Complexity ceiling** | Medium (~5–8 Functions + small SQL) | Medium–high (rules + second host) | High (adapter + IdP + store) |
| **Lock-in** | Low–medium (SQL portable; CF APIs specific) | PB low (SQLite); Supabase medium (Auth stickier) | Medium–high (Clerk) / medium (Auth.js + your schema) |
| **Main con** | First real ops step (migrations, local bindings) | Breaks light-backend / fork story | Wrong *next* step; Astro 7 Clerk lag + SSR tax |

---

## 3. Fit to Wave J phases

| Phase | Outcome | CF deepen | BaaS | Hosted IdP |
| --- | --- | --- | --- | --- |
| **1–4 (demo-local)** | Frontmatter + local stores + shells + a11y; AFK-safe | **Compatible** — do not bind D1 yet; keep `sessionStorage` / local social | **Compatible** — do not install SDKs; fixtures only | **Compatible** — do not add Clerk/Auth.js |
| **5 (hardening)** | Server enforcement + real persistence | **Primary recommendation** — D1 + cookies + Functions | **Fallback** if daylight picks second host | **Only if** SSR/Workers accepted *and* social store still planned |

Phases 1–4 are lane-agnostic by design: extend the **contract** (`agentId` / `attribution`, `canX`, social local store, admin UI shells). Phase 5 swaps store internals behind the same seams — no lane should be “built into” UI slices overnight.

---

## 4. This week vs daylight

### This week (demo contract only — Phases 1–4 / J3–J5+)

- Listing frontmatter: `agentId`, `attribution` (`attributed` \| `anonymous`) + sample anonymous PDP  
- Widen `canX()` (comment/rate/profile/posts/moderate/anonymous) + tests  
- Local social store (comments, ratings, demo `verifiedClient`)  
- AgentDesk / GuestHub / AdminShell UI against fixtures — **no** new auth/DB deps  
- Label UI: demo session ≠ server ACL  
- Keep Markdown `properties` / `blog` / `markets` in Git  

### Requires daylight human decision

- Accept **CF deepen** (or explicitly override to BaaS / IdP) before any Phase 5 PR  
- Provision secrets (`SESSION_SECRET`, BaaS keys, or Clerk/Auth secrets) and who owns ops  
- Whether mutating reviews / verified badge / anonymous flips must be **unforgeable** for a client demo (if yes → Phase 5 sooner)  
- Accept or reject SSR/Workers move (only relevant if IdP wins)  
- Template fork policy: every white-label gets CF D1 vs PocketBase URL vs Supabase project  

---

## 5. Explicit **DO NOT migrate overnight** gate

**AFK / overnight agents must not:**

- Add D1/KV bindings, Clerk, Auth.js, Supabase, PocketBase, Firebase, Appwrite, or `@astrojs/cloudflare`  
- Flip Astro `output` to `server` / `hybrid` for auth or BaaS  
- Replace `sessionStorage` demo auth with “real” sessions  
- Move `properties` / `blog` / `markets` out of Markdown collections  
- Treat Phase 1–4 UI as security — mutating production-like data without server checks  

**Unlock Phase 5 only when:** this doc is **daylight-accepted** (human ack in TODO / morning brief / ticket), secrets story exists, and a single ticket names the chosen lane’s MVP checklist (CF deepen §3 MVP, or BaaS/IdP companion non-goals inverted).

---

## 6. Open questions for daylight (max 5)

1. Is **unforgeable** moderation / verified badge required for the next client demo, or is labeled demo-local enough through Wave J UI?  
2. Confirm **default = CF deepen** for Phase 5, or override to PocketBase / Supabase / IdP with rationale?  
3. If CF deepen: who owns **D1 migrations + `wrangler pages dev`** docs for AFK agents?  
4. Are we willing to leave **pure static Pages** (no Astro SSR adapter) for the foreseeable future? (IdP ≈ no.)  
5. Per white-label fork: is **one CF account + bindings** acceptable, or must social stay optional/`comments.enabled: false` forever on the free template?

---

## 7. Scores

### Lane echoes

| Lane | Score | One-line why |
| --- | --- | --- |
| CF deepen | **4 / 5** | Right persistence rung on existing Pages Functions + R2; first real ops step but matches “backend light” |
| BaaS | **2 / 5** | Correct UGC home, wrong template story; if forced later → PocketBase over Supabase |
| Hosted IdP | **2 / 5** | Solves identity only; forces SSR/deploy tax; still needs D1 for Wave J social |

### Independent weighted score (this repo)

Weights tuned to OSEAD demo template priorities (not a generic SaaS app):

| Criterion | Weight | CF deepen | BaaS | Hosted IdP |
| --- | --- | --- | --- | --- |
| AGENTS / PLAN fit (light backend, Pages, Markdown SEO) | 30% | 5 | 2 | 2 |
| Unblocks Wave J social + moderation (Phase 5) | 25% | 5 | 5 | 3* |
| Deploy / AFK / fork simplicity | 20% | 4 | 2 | 1 |
| Cost & ops ceiling (demo) | 15% | 4 | 3 | 2 |
| Avoid premature SSR / second cloud | 10% | 5 | 2 | 1 |
| **Weighted total ( / 5 )** | | **4.6** | **2.9** | **2.0** |

\*IdP alone does not persist comments/ratings; score assumes IdP + thin D1 (compound work).

**Synthesis verdict:** Prefer **CF deepen** as the Phase 5 default (**independent ~4.6/5**). Ship Phases 1–4 demo-local now. Revisit only if daylight answers §6 override the weights (e.g. mandatory hosted Admin UI → PocketBase; mandatory SSO org UX → IdP + accept Workers).
