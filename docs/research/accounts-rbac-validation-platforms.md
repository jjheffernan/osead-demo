# Validation: `accounts-rbac-platforms.md` against OSEAD constraints

Stress-test pass, not a rewrite. Read against `accounts-rbac-feature.md`, `src/lib/demo-account.ts`, `docs/VISION.md`, `docs/specs/property-content.md`, `src/content.config.ts`, `functions/api/{contact,login,register}.ts`, `src/components/properties/AvailabilityInquiry.svelte`, and `src/config/{staff,marketplaces}.ts`. Spot-checked ~10 of the ~30 cited URLs live.

## 1. Overstatements / URL check

| Claim | Verdict |
| --- | --- |
| Twiddy Ops Portal (`ops.twiddy.com`) has its own login + "Looking for Guest Services Portal Log-In?" escape hatch | **Confirmed verbatim** — fetched page shows exactly this copy. |
| Twiddy Advance Property Hold opens "Tuesday after departure," first-come-first-served | **Confirmed, and slightly under-cited** — the live page adds a nuance the research doc collapses: *current guests* get first right of refusal through the following **Monday**; the **Tuesday** open-market date is only for everyone else. Minor precision gap, not wrong. |
| SynXis CRM-Login SSO (hidden `session` form field, `access_token`, POST to `be.synxis.com`) | **Confirmed verbatim**, including the exact form-field name and flow direction. This is the strongest-cited claim in the doc. |
| WPRentals "Affiliate Link" replaces Book Now with a redirect URL | **Confirmed**, with one nuance the research doc omits: the field only fires when the *standard booking form* is active — if the theme is set to show an owner contact form instead, the affiliate redirect is silently ignored. Worth knowing if this pattern is ever mirrored, but doesn't change the OSEAD recommendation. |
| kvCORE "one login, two experiences" (Web & IDX tab edits the same site consumers browse) | **Corroborated but not directly evidenced** — the fetched agent-marketing page confirms the Smart CRM / Web & IDX / Marketing Autopilot / Business Analytics feature list verbatim, but doesn't itself state "one login." That specific framing rests on the secondary reviews (Luxury Presence, InboundREM), which is defensible but should be read as *reviewer-corroborated*, not first-party-confirmed. |
| Compass One buyer features (Collections, tour requests, timeline, documents, team contacts) | **Confirmed** — fetched page matches the "For Buyers" panel almost word-for-word. |
| Vacasa homeowner account: real-time revenue dashboard, guest-privacy redaction, **step-up reauth gate on the tax-document tab** | **Unverified, flag for lower confidence.** The cited URL now resolves to a generic site-wide AI-crawler summary page, not the specific homeowner-account guide content the research doc quotes. The general shape (owner portal has financials, guests don't) is consistent with everything else in the space and is safe to keep as a *pattern*, but the specific "app makes you re-enter credentials just for the tax tab" detail could not be re-confirmed independently and reads like it came from a more specific sub-page or app-store description than the URL given. Treat the *concept* (step-up auth for financial views) as sound UX vocabulary; don't cite it as a hard fact without a better source. |
| Mews / Skipper deep-link doc pages | Fetch blocked (timeout / 403 — likely bot protection, not a broken link). Query-param deep-linking is well-established industry practice independent of these two vendors specifically (confirmed independently via WPRentals + SynXis + Flip.to patterns above), so the *pattern* claim stands even though these two specific pages couldn't be re-fetched here. |

**Net: no fabricated URLs found.** The one real overstatement is the Vacasa step-up-auth specificity — demote it from "documented fact" to "plausible pattern" if it's ever quoted elsewhere. Everything else checked either matched verbatim or was directionally correct with only minor precision gaps.

## 2. The load-bearing finding: "booking stays external" is already built, and it isn't external

This is the most important thing this validation pass surfaces, and the platform research doc doesn't know about it because it never read the actual component:

`src/components/properties/AvailabilityInquiry.svelte` **already implements the exact "Tier 1 query-string deep link" pattern** the research doc spends a full section researching (Mews/Skipper/WPRentals/Flip.to) — it validates dates against a mocked `blockedDates` array, builds a `URLSearchParams` (`intent=booking-inquiry&property&checkIn&checkOut`), and does `window.location.assign('/contact?' + query)`.

The catch: the deep link target is **`/contact` on the same site**, not a third-party booking engine. That's not a bug — it's `docs/VISION.md`'s locked intent, verbatim: *"Conversion: faux booking + check availability → contact (no live payments required for demo)"* and *"Contact/booking CTAs must not imply a confirmed paid reservation."* OSEAD has no real per-property external booking partner (unlike an Airbnb/Vrbo listing with a real ID) — `src/config/marketplaces.ts` only offers generic, non-property-specific "browse elsewhere" outbound links (Zillow, Airbnb, Vrbo, Compass, etc.), which is a different feature (marketplace discovery) from a booking handoff.

**Consequence for the research doc's recommendation #4** (`buildExternalBookingUrl(property, {...})` against a new `externalBookingUrl` frontmatter field): this field **does not exist** in `src/content.config.ts`'s `properties` schema (confirmed by reading the schema and grepping all 18 property `.md` files — zero hits for `externalBooking`, `bookingUrl`, `affiliateLink`). The research doc hedges with "reuse … if one exists," but it doesn't, so as written that recommendation is a request to add a new spec field + schema change for a capability that's already solved one layer up.

**Validation verdict on job #3:** Booking stays external in the sense that matters to OSEAD (no in-account transaction, no payment, no fake checkout) — but "external" means "hands off to the `/contact` inquiry form," not "hands off to a third-party booking engine." The account/RBAC feature should **reuse `AvailabilityInquiry.svelte`'s existing query-string shape** (feed it into the guest's saved-inquiry local storage, and give the agent role a read view of the same `intent=booking-inquiry` payloads the Function already logs) rather than building a net-new URL-builder against a field that doesn't exist. Zero schema change needed for this wave.

## 3. Platform UX patterns ranked — what ships THIS wave (sessionStorage/localStorage only, no schema change)

Ranked by (a) how directly it maps onto code that already exists and (b) distance from VISION's "no CMS/DB/booking engine" wall.

1. **Guest "saved listings" toggle (RealScout Interested/Uninterested, simplified).** Pure client-side `localStorage: savedListingSlugs: string[]`, keyed off property `slug` (already unique per `property-content.md`). No new field, no new Function. Ships today.
2. **Guest "my inquiries" mirror of what `/contact` already accepts.** The `ContactInquiry` shape in `functions/api/contact.ts` (`intent`, `property`, `checkIn`, `checkOut`, `message`) is already exactly what a guest-side inquiry-history list needs — just persist the client's own copy of what it POSTed, the same way `demo-account.ts` persists its own session. No Function change; the Function already returns `202` with no body to echo, so the client writes its own local record right after a successful POST.
3. **Agent inbox scoped by a static `assignedAgentId`.** This is the one place a schema-adjacent decision is unavoidable, but it's the lightest version possible: don't add anything to `content.config.ts`; seed a small in-repo lookup table (inquiry-shape-key → `staff.ts` id) the same weight class as `marketplaces.ts` or `staff.ts` itself — a plain `.ts` config array, not a frontmatter field, not a DB table.
4. **Agent "my inventory" slice filtered by existing `market` field.** `properties` already has `market` (`outer-banks | jersey-shore | delaware-beaches | other-coastal`) — filter `demoStaff` agents to a market via a config map, no new frontmatter needed. Skip the research doc's suggested new `agentId` property field for this wave; market-scoping is one field lighter and ships from data that already exists on every listing.
5. **Widen `DemoRole` to `"admin" | "agent" | "guest"`.** Real code-touch, not just a type change — `src/pages/account.astro` currently branches on exactly two states (`admin` vs. everything-else-shown-as-plain-user), so this needs a third `data-account-agent` panel, a `roleForEmail`-style agent allowlist sourced from `demoStaff`, and matching updates in `login.ts`/`register.ts` response shape + `AccountAuthForm.svelte` + the existing `demo-account.test.ts`. Straightforward, but size this as the actual unit of work, not a one-line type edit.

**Explicitly NOT this wave** (confirms the research doc's own "what not to copy," cross-checked against `VISION.md`/`PLAN.md` Phase 5 non-goals): IDX/MLS search, owner/agent financials, native app group-voting, lead-routing configuration UI, any real SSO/token handoff. All correctly excluded already; no correction needed there.

## 4. Concrete capabilities that fit existing primitives (agent vs. guest)

Everything below maps to a field, file, or endpoint that already exists — no invented backend.

**Guest** (backed by: `localStorage`, `property.slug`, `ContactInquiry` shape, `marketplaces.ts`):
- Toggle-save a property by slug; render a "Saved homes" list on `/account`.
- See own inquiry history (property, dates, submitted-at, intent) as a local mirror of what was POSTed to `/contact` — status is always "sent," there's no real pipeline to reflect a status change, so don't invent a fake `status: "confirmed"` field; call it what it is ("submitted").
- "Continue to book" CTA reuses `AvailabilityInquiry.svelte`'s exact `/contact?intent=booking-inquiry&property&checkIn&checkOut` deep link — already built, just needs the guest-side local-storage write hooked onto its `submitInquiry` success path.
- One outbound "browse other marketplaces" link exists already (`marketplaces.ts`) — don't duplicate it as a per-guest feature; it's a page-level, not account-scoped, concern.

**Agent** (backed by: `demoStaff` in `staff.ts`, `market` field on `properties`, the same `ContactInquiry` console-logged payload):
- Inbox: a static seed mapping known demo inquiries (or a small fixture list, since real inquiries never persist server-side beyond a `console.log`) to a `demoStaff` id — "assigned via market rotation" label, per Real Geeks vocabulary the research doc already surfaced.
- "My inventory": filter `getPropertiesByListingType`/`getMarkets` results (already used in `account.astro`'s `inventory` array) down to the agent's assigned market — read-only, no edit surface, keeping the "inbox + inventory slice, not AdminShell" boundary the research doc correctly draws.
- Profile: render the agent's own `demoStaff` bio/role — already-seeded data, zero new fields.
- Explicitly no messaging thread, no document library, no financials — nothing here has a backend to persist a two-way thread, and VISION.md's "no mandatory CMS/DB" wall rules out building one for this wave. A `mailto:`/`/contact` link naming the assigned agent is the correct ceiling (research doc's own "visible line to a human agent" recommendation, minus a fake chat UI).

## 5. Answering the four job items directly

1. **Overstatements/wrong URLs:** none fabricated; one claim (Vacasa step-up reauth) should be downgraded from "documented" to "plausible pattern" — see §1.
2. **Ranked shippable patterns:** saved listings → inquiry mirror → agent inbox (static assignment) → agent inventory slice (market-scoped) → `DemoRole` widening. See §3.
3. **Booking stays external:** confirmed in intent, but the mechanism is already built and it's an *internal* deep link to `/contact`, not a third-party engine — reuse `AvailabilityInquiry.svelte`, don't add an `externalBookingUrl` field. See §2.
4. **Concrete capabilities fitting existing contact/inquiry + Markdown:** see §4 — every listed capability names the exact existing file/field it rides on.

## Top 3 build-now items

1. **Guest local storage: saved-slugs + inquiry-history mirror**, wired onto `AvailabilityInquiry.svelte`'s existing submit path — zero schema change, zero new Function.
2. **Widen `DemoRole` to `admin | agent | guest`** in `src/lib/demo-account.ts` + the matching third branch in `src/pages/account.astro`, sourcing the agent allowlist from `demoStaff` — the one real code-touch this wave, sized correctly instead of assumed trivial.
3. **Agent inbox + market-scoped inventory slice**, using a static assignment config (same weight class as `staff.ts`/`marketplaces.ts`) and the existing `market` field on `properties` — explicitly skip the research doc's proposed new `agentId` frontmatter field for now.

Deliverable path: `docs/research/accounts-rbac-validation-platforms.md`
