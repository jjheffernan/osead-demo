# Backend migration — hosted IdP / auth-first

**Status:** Research only (Wave J companion)  
**Lane:** Clerk · Auth.js (CF Workers/Pages) · Lucia as light contrast  
**Stack today:** Astro 7 static · Svelte 5 islands · Cloudflare Pages · `sessionStorage` demo auth (`DemoRole = admin | agent | guest`)  
**Companion:** `access-a11y-accounts-feature.md` · `backend-migration-decision.md`

## TL;DR

A hosted IdP buys **real identity, sessions, and role claims**. It does **not** buy comments, ratings, listing ownership, or Markdown content. On this repo it also forces an **SSR / deploy-shape change** the site has never made. Ponytail: keep the Wave I demo seam; decide backend in daylight; **do not install Clerk/Auth.js yet**.

**Recommendation score (hosted IdP as the NEXT step): 2 / 5**

---

## 1. What IdP solves vs what it does not

| Solves | Does **not** solve |
| --- | --- |
| Sign-in / sign-out, password or OAuth | Property Markdown bodies / images / SEO |
| Durable server-verified session | Comments & ratings persistence |
| Role claims (`admin` / `agent` / `guest`) | Listing ↔ agent attach / anonymous mode |
| User directory + webhooks for ops | Blog authorship storage beyond claim IDs |
| Replacing `sessionStorage` self-promotion | Booking, payments, IDX, multi-tenant SaaS |

**Pairing (thin store, not BaaS):** IdP owns `userId` + claims. Put social rows in **one** CF binding — prefer **D1** (`comments`, `ratings`, `verified_clients` keyed by `user_id` + `listing_slug`) or **KV** only if the shape stays flat key→JSON. Pages Functions (or Worker handlers after an SSR move) read `Authorization` / session cookie from the IdP, then CRUD the table. Listings stay in `src/content/properties/*.md`. No Supabase/Firebase/Appwrite in this lane.

---

## 2. Role claims → `DemoRole` + verified-client

Keep the app contract: `DemoRole = "admin" | "agent" | "guest"`. Map IdP → that enum in one place (today: inside `readDemoAccount()` / a future `getSession()`).

| App role | Clerk | Auth.js (JWT / session) |
| --- | --- | --- |
| `admin` | `publicMetadata.role` or org role `admin` | `token.role` / `session.user.role` |
| `agent` | same + optional `staffId` linking `demoStaff[].id` | same |
| `guest` | default for everyone else | default |

**`verified-client`:** not a fourth `DemoRole`. Store as **claim or metadata** (`publicMetadata.verifiedClient: true` or D1 flag keyed by `userId`). UI badge + admin moderation read the flag; capability helpers stay role-based (`canSaveHomes`, etc.).

```ts
// Conceptual — do not implement yet
type SessionAccount = {
  userId: string;
  name: string;
  email: string;
  role: DemoRole;           // from IdP claim
  verifiedClient?: boolean; // claim OR thin-store lookup
  staffId?: string;         // agents only → demoStaff id
};
```

Existing `canX(role)` helpers stay; IdP only makes `role` trustworthy server-side.

---

## 3. Astro 7 + CF Pages integration friction

**Facts on this repo:** `astro.config.ts` has no `adapter` / `output` override → static build. Auth is client `sessionStorage` + stateless `functions/api/{login,register}.ts`. Zero auth npm deps.

| Option | Fit | Friction |
| --- | --- | --- |
| **Clerk (`@clerk/astro`)** | Strong product UX (hosted UI, orgs, webhooks) | Needs SSR adapter + middleware (`clerkMiddleware` / `locals.auth`). Official quickstart still pins/guards around Astro 6; **Astro 7 support in progress** as of mid-2026. Client bundle ~70–100kb gz. Secrets + Clerk dashboard. |
| **Auth.js** (`auth-astro` / forks) | Open, provider-flexible | No first-class Astro core package; community wrappers. Typically `output: "server"`/`"hybrid"` + adapter. On CF, session store wants **D1** (`@auth/d1-adapter` / `auth-astro-cloudflare-d1`-class forks) or JWT-only (weaker revoke). `AUTH_SECRET`, `AUTH_TRUST_HOST`, provider keys. |
| **Lucia** | Light contrast only | **npm `lucia` deprecated (2025)** — copy a session-table pattern yourself. Same SSR + D1 needs as Auth.js, more hand-rolled code, no hosted admin UI. |

**Deploy-shape tax:** `@astrojs/cloudflare` (Astro 6+) targets **Workers**, not classic Pages static upload. Enabling SSR for Clerk/Auth.js is not “add middleware to current Pages static site” — it is adapter + wrangler assets/Worker entry + likely leaving pure-static Pages. Existing `functions/api/*` stay useful as thin API, but auth middleware wants to live in the Astro/Worker request path.

**Ponytail read:** friction is **compound** (adapter + IdP + secrets + store for social). Wrong “next step” while Wave J social can still be demo-local.

---

## 4. Keep Markdown listings; attach `agentId` / anonymous

Do **not** move listings into the IdP or a CMS for ownership.

| Field (frontmatter) | Purpose |
| --- | --- |
| `agentId?: string` | Matches `demoStaff[].id` / agent `staffId` claim — attributed PDP |
| `anonymous?: boolean` | Admin-only; brand CTAs, no staff face (Wave J modes) |

Schema + `docs/specs/property-content.md` gain optional fields when a **content** ticket lands — independent of IdP. Agent “my listings” = filter collection by `agentId === session.staffId`. Blog “own posts” = same pattern (`authorId` in blog frontmatter) or a thin D1 override table; Markdown remains source of truth for demo authenticity.

IdP only supplies the **stable `userId` / `staffId`** the frontmatter points at.

---

## 5. Admin observability hooks

| Hook | Clerk | Auth.js |
| --- | --- | --- |
| User list | Dashboard + Backend API | Your DB / provider APIs (you build the list UI) |
| Role / verified flips | Dashboard metadata or Backend API | Admin Function updating JWT claims / user row |
| Events | **Webhooks** (`user.created`, `session.created`, …) → Pages Function → optional D1 audit | Provider webhooks or Auth.js events → same |
| Social moderation feed | Not in IdP — query D1 `comments`/`ratings` + join `userId` | Same |

Admin shell already wants a global feed (Wave J). IdP covers **who users are**; D1 covers **what they posted**. Wire webhooks only when server auth is real — otherwise they fire into a demo that still trusts `sessionStorage`.

---

## 6. Cost / complexity vs demo authenticity

| | Demo `sessionStorage` (now) | Hosted IdP + thin D1 |
| --- | --- | --- |
| Click-through seeds | Instant, zero signup | Needs seeded users or bypass — fights template forks |
| Forkability | Clone → build → Pages | Clerk/Auth secrets + dashboard per fork |
| Money | $0 | Clerk free tier then paid; Auth.js free code, ops time |
| Authenticity | Fake security, real UX shells | Real auth; still need Markdown + D1 for Wave J social |
| Build risk | Low | High (SSR + CF target shift + Astro 7 Clerk lag) |

Template story (“coastal demo, book externally”) does not need production SSO on day one. Real IdP **helps authenticity of accounts**, not of listings or reviews.

---

## 7. Ladder (ponytail)

1. **Need IdP now?** No — Wave J roles/shells exist; social can stay local or wait for a thin store ticket.  
2. **Already have a seam?** Yes — `demo-account.ts` + `canX()` + Functions response shape.  
3. **Native CF?** Access is edge-gate for `/admin`, not demo login buttons.  
4. **Hosted IdP next?** Only after daylight picks auth-first **and** accepts SSR/Workers move.  
5. **Lucia?** Skip as a product — use it only as “we’d hand-roll sessions in D1,” which is Auth.js-without-Auth.js.

---

## 8. Explicit: do not build yet

- Do **not** add `@clerk/astro`, `auth-astro`, `@auth/core`, Lucia session tables, or `@astrojs/cloudflare`.  
- Do **not** flip `output` to `server`/`hybrid` for auth alone.  
- Do **not** provision Clerk orgs / OAuth apps for this research lane.  
- Do **not** treat IdP adoption as unlocking comments/ratings — schedule a **thin D1/KV** (or stay demo-local) separately.  
- **Do** keep mapping docs and `ponytail:` seams so a later swap edits `demo-account.ts` internals, not every shell.

**When to reopen:** daylight decision chooses auth-first **and** Wave J needs server-enforced roles (moderation, verified badge that can’t be forged) **and** team accepts Workers/SSR migration cost.
