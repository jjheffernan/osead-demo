# Access & accessibility accounts — vertical phase plan (MVP → implementation)

**Feature SoT:** `docs/research/access-a11y-accounts-feature.md`  
**Extends:** Wave I (`admin | agent | guest`, GuestHub / AgentDesk / AdminShell)  
**Backend decision:** deferred to `docs/research/backend-migration-decision.md` (synthesis of CF / BaaS / IdP lanes)  
**AFK rule:** Phase 0–1 are docs + demo-local only (zero new deps). Phases 2+ may unlock a store **only after** daylight accepts the backend decision.

---

## North star

Employees and consumers should **find, understand, and complete** their account jobs without guessing. Scope grows by role:

```text
guest  → comment, rate, show verified badge, keep saves/inquiries
agent  → own posts, edit profile, attached listings (or anonymous hide)
admin  → see/moderate all of the above + assignment health
```

Every phase ships: **role routes**, **a11y baseline**, and **observability** (even if demo-local).

---

## Architecture seam (keep)

```text
┌──────────────┐     sessionStorage      ┌─────────────────┐
│ login/register│ ─────────────────────▶ │ DemoAccount     │
│ CF Functions  │   role: admin|agent|guest│ canX() helpers  │
└──────────────┘                         └────────┬────────┘
                                                  │
         ┌────────────────────────────────────────┼────────────────┐
         ▼                                        ▼                ▼
   GuestHub (+ social)                    AgentDesk (+ mine)   AdminShell (+ mod)
         │                                        │                │
         └──────── localStore / future API ───────┴────────────────┘
```

`ponytail:` Wave I already marked IdP seam on session read/write — later backends replace that seam; UI keeps calling `canX()`.

---

## Accessibility baseline (every phase)

Apply to **all** account shells and new social widgets:

| Check | Rule |
| --- | --- |
| Landmarks | One `<main>`, labeled regions for panels (`aria-labelledby`) |
| Focus | Visible focus rings (token); modal/drawer trap if any |
| Forms | `<label>` / `aria-describedby` errors with `role="alert"` |
| Status | Async save → `role="status"` / `aria-live="polite"` |
| Contrast | Semantic tokens only; no decorative-only meaning |
| Keyboard | All primary actions reachable; no hover-only gates |
| Names | Icon buttons have accessible names |

**Observability for a11y:** Admin “Access health” checklist (Phase 1+) lists shells + last smoke pass; not a Lighthouse CI gate overnight.

---

## Phase map (vertical)

| Phase | Name | Outcome | AFK-safe? |
| --- | --- | --- | --- |
| **0** | Research & decision | Feature brief + this plan + backend lane reports + synthesis | Yes |
| **1** | MVP demo contract | Frontmatter + local stores + UI gates; still client-only | Yes |
| **2** | Agent “mine” surfaces | Profile edit (demo), own posts filter, listing attach | Yes (local) |
| **3** | Guest social | Comments + ratings + verified badge UX | Yes (local) |
| **4** | Admin routes + observability | Moderation panels, anonymous toggle, audit list | Yes (local) |
| **5** | Hardening / real store | Server enforcement per backend decision | **Daylight** |
| **6** | Polish & a11y pass | Density, empty states, docs status | Yes |

Build order is **vertical slices** inside phases (one commit / one TODO checkbox), not horizontal “all profiles then all comments.”

---

## Phase 0 — Research & decision (this night)

### Deliverables

1. `access-a11y-accounts-feature.md` — locked intent  
2. This phases doc  
3. Three lane reports: CF deepen / BaaS / hosted IdP  
4. `backend-migration-decision.md` — pros/cons synthesis (no auto-migrate)

### Acceptance

- All four research docs exist under `docs/research/`  
- Explicit recommendation + **daylight decision required** before Phase 5  
- TODO Wave J research checkboxes with acceptance criteria  

### Observability

- Research index links from feature SoT  
- Morning brief lists research SHAs  

### Admin routes

_None yet_ (docs only).

---

## Phase 1 — MVP demo contract (client-only)

**Goal:** Extend the **data contract** so later UI has somewhere to hang, without a real backend.

### 1A — Listing attribution frontmatter

| Field | Type | Meaning |
| --- | --- | --- |
| `agentId` | `string?` | Links to `demoStaff.id` / assignment |
| `attribution` | `"attributed" \| "anonymous"` | Default `attributed`; `anonymous` hides staff face |

**Files:** `docs/specs/property-content.md`, `src/content.config.ts`, 1–2 sample properties.

**Acceptance:** Schema validates; anonymous sample PDP shows brand CTAs only (no staff card).

### 1B — Capability helpers widen

Add (still in `demo-account.ts`):

- `canComment` / `canRate` → guest (and maybe agent?)  
- `canEditOwnProfile` → agent  
- `canEditOwnPosts` → agent  
- `canModerateSocial` / `canSetAnonymousListing` → admin  
- `canViewVerifiedBadge` → all signed-in; `isVerifiedClient` flag on account later  

**Acceptance:** Unit tests for role matrix; no new file.

### 1C — Guest social local store

Extend `guest-store` or sibling `social-store.ts`:

- comments: `{targetType, targetId, body, at}`  
- ratings: reuse/extend existing rating inquiry path; persist local copy  
- `verifiedClient: boolean` demo flag (admin can flip in Phase 4 UI)

**Acceptance:** Round-trip tests; no server.

### 1D — A11y pass on existing shells

GuestHub / AgentDesk / AdminShell: landmarks, live regions, focus order.

**Acceptance:** Manual keyboard pass notes in `docs/research/access-a11y-smoke.md` (short).

### Routes (Phase 1)

| Path | Who | Job |
| --- | --- | --- |
| `/account` | all | Existing shells |
| `/properties/[slug]` | public | Honor `attribution` |

### Observability (Phase 1)

- Console-free; Admin Overview tile stub: “Social (demo): N comments / N ratings” reading local aggregates when admin session (Phase 4 fills UI).

---

## Phase 2 — Agent “mine” surfaces

### 2A — Agent profile edit (demo)

AgentDesk → Profile: editable display fields mirrored into `localStorage` keyed by email (override of `demoStaff` display only).

**Acceptance:** Reload keeps edits; admin still sees seed staff until Phase 5.

### 2B — Own blog posts

Filter `getCollection('blog')` (or existing posts) where `authorId` / staff match session; AgentDesk “My posts” list + deep-link to edit path if ContentEditor already supports it, else read-only list + `ponytail:` note.

**Acceptance:** Demo agent sees ≥1 post when fixture links exist; guest sees none of this panel.

### 2C — Listing attachment UI (agent-scoped)

AgentDesk inventory: show listings where `agentId` matches; CTA “request attach” is demo-only log unless admin. Admin Phase 4 sets `agentId` in content editor or static config.

**Acceptance:** Attached list non-empty for demo agent market; anonymous listings excluded from “my face” marketing modules.

### Routes

| Path | Who | Job |
| --- | --- | --- |
| `/account` AgentDesk tabs | agent | Profile / Posts / Inventory |
| `/account` admin content | admin | Set `agentId` / `attribution` (Phase 4 if not ready) |

### Observability

- AgentDesk “Assigned pulse” includes attached listing count  
- Admin later: agents with 0 attachments warning  

---

## Phase 3 — Guest social (comments, ratings, badge)

### 3A — Comments on PDP (demo)

Guest-only form → `social-store`; list under ratings section; `aria-live` on submit.

**Acceptance:** Guest can post; signed-out sees read-only or CTA to login; agent/admin can read.

### 3B — Ratings persistence

Hook `RatingSubmit.svelte` success into store (parallel to inquiry mirror). Show aggregate from store + content testimonials (label sources).

**Acceptance:** Guest rating appears in GuestHub history.

### 3C — Verified client badge

- Account flag `verifiedClient` (demo)  
- Badge component on GuestHub + optional comment byline  
- Copy: “Verified client” only when true  

**Acceptance:** Unverified guest has no badge; flipping flag (admin Phase 4) shows badge without reload tricks beyond session update.

### Routes

| Path | Who | Job |
| --- | --- | --- |
| `/properties/[slug]#comments` | public/guest | Read / post |
| `/account` GuestHub | guest | My comments / ratings / badge |

### Observability

- GuestHub counts  
- Feed into admin moderation queue (Phase 4)  

---

## Phase 4 — Admin routes + observability

### 4A — Admin “Access & social” panel

New AdminShell panel (or subsection):

- Recent comments/ratings (from demo store)  
- Toggle verified on demo guest emails  
- List anonymous vs attributed listings (from collection)  
- Agent attachment coverage table  

### 4B — Anonymous listing control

Content editor or admin-only control sets `attribution: anonymous` (demo: mutate local overlay map if Markdown write is too heavy overnight — prefer frontmatter edit via existing ContentEditor if safe).

### 4C — Access health checklist

Static checklist UI: shells present, capability matrix link, last build green note.

### Routes

| Path | Who | Job |
| --- | --- | --- |
| `/account` → Admin panel `access` | admin | Moderate + observe |
| Existing analytics | admin | Unchanged |

### Observability (definition of done for Phase 4)

| Signal | Guest | Agent | Admin |
| --- | --- | --- | --- |
| Own activity | GuestHub | AgentDesk | — |
| Moderation queue | — | — | Access panel |
| Attribution mode counts | — | — | Access panel |
| Verified clients | badge | — | toggle + count |
| A11y smoke doc | — | — | linked |

---

## Phase 5 — Hardening (daylight — backend decision)

**Gate:** `backend-migration-decision.md` accepted.

Replace local stores with chosen persistence; enforce roles server-side; keep UI contracts.

| If decision… | Do |
| --- | --- |
| Stay + CF deepen | D1 tables + Functions auth cookies; KV for sessions |
| BaaS | Auth + RLS policies mirroring `canX()` |
| Hosted IdP | Claims → role; D1/KV for social rows |

**Not AFK-default** until decision + secrets story exist.

---

## Phase 6 — Polish

- Empty states, denser desks, copy pass  
- Feature status → Built  
- Janitor: tokens, dead attrs, no role literal drift  

---

## Suggested AFK V-slice order (Wave J)

Research first (maxPrs budget), then MVP contract:

| ID | Slice | Phase | Executor |
| --- | --- | --- | --- |
| J0 | Feature SoT + this phases doc | 0 | research-only / docs |
| J1 | Backend lane reports land | 0 | research-only |
| J2 | Backend decision synthesis | 0 | research-only |
| J3 | Listing `agentId` + `attribution` schema + anonymous sample | 1 | feature-build |
| J4 | Capability helpers + tests | 1 | feature-build |
| J5 | Social local store + tests | 1 | feature-build |

Further J6+ (agent mine / guest social UI / admin panel) arm only after J0–J5 green and budget allows — or next night.

---

## Risk register

| Risk | Mitigation |
| --- | --- |
| Scope explosion into CMS | Phase 5 gated; Phases 1–4 demo-local |
| Fake security | Docs + UI copy: “demo session”; server enforce only in Phase 5 |
| A11y regress | Baseline checklist every UI slice |
| Backend bikeshed | Three lanes + one synthesis; no migrate overnight |
| maxPrs=5 | Stop after J0–J4 or J0–J5; defer UI waves |

---

## Definition of MVP (ship-feeling demo)

1. Anonymous listing hides staff profile.  
2. Agent sees “my” posts + profile edit (local) + attached listings.  
3. Guest can comment/rate; verified badge when flagged.  
4. Admin can see/moderate those signals and set anonymous / verified.  
5. Keyboard-usable account shells.  

Anything beyond that is Phase 5+ or a new wave.
