# Accounts + RBAC — Wave I feature push

**Status:** Built — Phase 2 complete (I1–I10 landed on `main`, see `docs/research/accounts-rbac-v-slices.md`)  
**Goal:** Demo-ready roles for **admin**, **agent** (realtor/staff), and **guest** (customer) with clear UX gates. Booking stays external; this site owns experience + RBAC. Stack stays Astro 7 → Svelte 5 → thin TS on Cloudflare Pages. No mandatory CMS/DB/Auth SaaS unless a later ticket asks.

## Locked product intent

| Role | Who | Experience |
| --- | --- | --- |
| `admin` | Brokerage ops | Existing AdminShell (analytics, content, site tools) |
| `agent` | Realtors / staff | Agent desk: assigned inventory pulse, inquiries, profile; not full site content edit by default |
| `guest` | Customers | Guest hub: saved homes, inquiry history, deep-links to external booking/showing |

## Existing contract (extend, don’t throw away)

- `src/lib/demo-account.ts` — `DemoRole` today is `"admin" \| "user"`
- `/login`, `/register`, `/account` + `functions/api/{login,register}.ts`
- Staff seed: `src/config/staff.ts` (`demoStaff`)

## Phases

| Phase | Outcome |
| --- | --- |
| **1 Research** | Platform + stack reports → validation → V-slices in `docs/research/` + `TODO.md` Wave I |
| **2 Build** | After-hours local commits on `main` (no GitHub PR HITL) |
| **3 Polish** | Daylight: push, UX densify, real IdP later |

## Explicit non-goals (this wave)

- Live OAuth / Clerk / Auth0 wiring (document plug shape only)
- Native booking calendar / payments
- Multi-tenant SaaS admin
- IDX/MLS sync
