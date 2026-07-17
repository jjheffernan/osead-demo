# Research: real estate analytics platforms (plug-in candidates for OSEAD admin)

Research pass for the admin-analytics feature (see `docs/research/admin-analytics-feature.md`). Goal: catalog what brokers/property managers already use for sales volume, occupancy, rental GMV, listing performance, comps, and agent KPIs — and rate how easily each could feed the OSEAD admin dashboard versus which patterns OSEAD should just build first-party.

**Existing OSEAD contract** (already shipped, do not rebuild): `src/lib/admin-analytics.ts` defines `AdminAnalyticsPayload` (rows of `period/season/market/employeeId/salesVolume/rentalRevenue/occupiedNights/availableNights/closedDeals`). `AdminAnalytics.svelte` loads it via, in order: `window.__OSEAD_ADMIN_ANALYTICS__` (sync global injection) → `fetch(PUBLIC_ADMIN_ANALYTICS_URL)` (REST poll) → deterministic demo seed. Every integration pattern below is evaluated against "can it fill this shape."

## Executive summary

- **Every serious PMS/CRM in this space gates its API behind a paid tier, partner agreement, or "contact sales."** There is no vacation-rental or brokerage platform with a fully open, anonymous-signup analytics API. Expect OAuth2 + an account on the platform as a baseline cost for any live integration.
- **Short-term-rental (STR) revenue-management tools have the most mature, personal-access-token-friendly APIs** — Beyond, PriceLabs, and Wheelhouse all ship documented REST APIs with per-user personal access tokens (no enterprise sales call required), plus 2026-era MCP servers aimed at AI agents. These are the most realistic "plug into OSEAD" candidates for the rental side.
- **PMS platforms (Guesty, Hostaway, Track, Escapia) expose reservation/listing/financial data via OAuth2 REST + webhooks**, but computed analytics (occupancy %, ADR, RevPAR) mostly live in vendor dashboards, not raw API fields — you'd recompute KPIs from raw reservation data yourself, which is exactly what `admin-analytics.ts` already does from demo rows.
- **Brokerage CRMs (kvCORE/BoldTrail, Follow Up Boss, BoomTown, Sierra Interactive, MoxiWorks) are lead/contact/transaction systems, not analytics platforms.** Their "Business Analytics" dashboards are UI-only; the APIs expose leads, contacts, and transactions, and you'd derive sales-volume/agent-KPI numbers from those records, not pull a ready-made KPI payload.
- **Market/comps data (ATTOM, HouseCanary, CoreLogic/Cotality Trestle, Reonomy, Zillow/Bridge Interactive) is priced per-record or by enterprise contract**, not something a small brokerage template wires up by default — this is external-market-color data (for CMAs, comps widgets), not internal ops analytics, and it's the category OSEAD should treat as an optional future add-on, never a requirement.
- **BI embed tools (Looker Studio, Metabase, Power BI, Tableau Public) are the honest fallback for "I already have a spreadsheet/warehouse and want a chart on my site."** Looker Studio and Metabase's guest/static embeds are the only genuinely no-cost path; Power BI "Publish to Web" and Tableau Public both mean the data is fully public with no row-level security — fine for a marketing KPI strip, wrong for anything with real agent/owner numbers.
- **Net for OSEAD:** keep the demo-seed + `PUBLIC_ADMIN_ANALYTICS_URL`/`window.__OSEAD_ADMIN_ANALYTICS__` contract as the first-party core (cheap, no vendor lock-in, works offline for the template buyer). Document it as an **iframe/webhook/REST receiver target** that a real PMS+CRM combo (e.g., Hostaway or Guesty for rentals, kvCORE/Follow Up Boss for sales) can be scripted to fill, rather than trying to build a bespoke connector to any one vendor.

## Comparison table

| Platform | Category | Primary user | Public API? | Auth | Export formats | Webhooks | Embed widget | OSEAD fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Guesty](https://open-api-docs.guesty.com/docs/quick-start-guide) | STR PMS | Property manager | Yes, Open API | OAuth2 client credentials | JSON | Yes | No | REST poll → recompute KPIs |
| [Hostaway](https://api.hostaway.com/documentation) | STR PMS | Property manager | Yes, public REST | OAuth2 / API key | JSON; CSV in-app | Yes (3 event types) | No | REST poll + webhook push |
| [Escapia](https://developer.escapia.com/) (Vrbo/Expedia) | STR PMS | Property manager | Partner-only GraphQL | OAuth bearer (contract required) | JSON (GraphQL) | No (batch XML/SOAP feeds) | No | Enterprise-only, skip for template |
| [Track / TrackHS](https://developer.trackhs.com/) | STR PMS | Property manager | Yes, REST | API key + secret (Basic Auth) | JSON | Unclear/limited | No | REST poll via connector (Airbyte etc.) |
| [Beyond](https://developers.beyondpricing.com/) (ex-Beyond Pricing) | STR revenue management | Property manager / revenue mgr | Yes, Partners + Personal API | OAuth2 (partners) or PAT (individuals) | JSON:API | Yes, signed | No | **Best-fit rental plug-in** |
| [PriceLabs](https://developers.pricelabs.co/) | STR revenue management / market data | Property manager | Yes, Customer API | API key (`X-API-Key`) | JSON; CSV export in-app | Unclear | No | Strong fit for occupancy/ADR/comps |
| [Wheelhouse](https://www.usewheelhouse.com/api-docs) | STR revenue management | Property manager | Yes, RM/Pro/Lite APIs | API key / OAuth | JSON | Unclear | No | Good fit, pricing + KPI endpoints |
| [kvCORE / BoldTrail](https://developer.insiderealestate.com/) | Brokerage CRM + IDX | Broker / agent | Yes, REST v2 | Token (max 3/account) | JSON; manual CSV export | Limited | No | Derive sales/agent KPIs from contacts+transactions |
| [Follow Up Boss](https://docs.followupboss.com/) | Brokerage CRM | Agent / team lead | Yes, REST | API key + `X-System` header | JSON | Yes (2/event limit) | No | Lead-pipeline KPIs, not sales volume directly |
| [Sierra Interactive](https://api.sierrainteractivedev.com/) | Brokerage CRM/IDX | Broker / agent | Yes, REST | API key header | JSON | Yes | No | Lead/listing data, needs custom rollups |
| [BoomTown](https://developer.boomtownroi.com/) | Brokerage CRM | Broker / team | Yes, REST | OAuth2 | JSON | Yes | No | Same shape as Follow Up Boss |
| [MoxiWorks (MoxiCloud)](https://moxiworks-platform.github.io/) | Brokerage CRM/suite | Broker / agent | Yes, partner REST | Platform ID/secret + OAuth2 (by invite) | JSON | Yes (SNS stream) | No | Partner approval required, low priority |
| [ATTOM Data](https://api.developer.attomdata.com/home) | Market data / comps / AVM | Broker / investor / lender | Yes, self-serve trial | API key | JSON/XML | No | No | Comps enrichment, paid at scale (~$95–500+/mo) |
| [HouseCanary](https://www.housecanary.com/products/data-explorer) | Market data / AVM / comps | Broker / lender | Yes, Data Explorer API + MCP | API key/secret | JSON | No | No | Best comps/AVM docs of the group; priced |
| [CoreLogic / Cotality (Trestle)](https://trestle-documentation.corelogic.com/) | MLS data / comps | MLS / broker | Yes, Trestle WebAPI (OData) | OAuth2 | JSON (OData) | No | No | MLS-credentialed only, not self-serve |
| [Reonomy](https://api.reonomy.com/v2/docs/guides/getting-started/) | Commercial market data / ownership | CRE broker / investor | Yes, REST | Access token (credit-based) | JSON | No | No | Commercial-only, not relevant to weekly rentals |
| [Zillow data via Bridge Interactive](https://www.bridgeinteractive.com/developers/bridge-api/) | Market data / MLS distribution | MLS / broker (enterprise) | Partner-only (RESO Web API) | OAuth2 + MLS approval | JSON (OData) | No | No | Zillow public API is dead; Bridge is enterprise-only |
| [Looker Studio](https://lookerstudio.google.com/) | BI / dashboards | Anyone with Google acct | No management API; iframe only | Google auth (viewer) or public link | PDF, iframe | No | Yes, iframe | Best free option for public KPI strip |
| [Metabase](https://www.metabase.com/docs/latest/embedding/introduction) | BI / dashboards (self-host or cloud) | Internal ops | Yes, REST + SDK | API key / JWT SSO (Pro+) | CSV/JSON/XLSX; iframe | No | Yes, static/guest/full-app embeds | Good self-hosted option if OSEAD buyer has a DB |
| [Power BI](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web) | BI / dashboards | Enterprise ops | Yes (Embedded, paid) | Azure AD / service principal | Excel, CSV, PDF; iframe | No | Yes, "Publish to web" (public) or Embedded (secure) | Publish-to-web = public data only, no RLS |
| [Tableau Public](https://www.tableau.com/products/public) | BI / dashboards | Anyone (public) | No API for Public tier | N/A (no auth, fully public) | iframe embed; underlying data downloadable | No | Yes, iframe | Public-only, static snapshot, no live refresh |

## Per-platform notes

### Vacation rental / PMS analytics

**Guesty** — [Open API](https://open-api-docs.guesty.com/docs/quick-start-guide) · [Advanced Analytics docs](https://help.guesty.com/hc/en-gb/sections/9112126452125-Advanced-Analytics)
REST API at `https://open-api.guesty.com/v1`, OAuth2 client-credentials (generate Client ID/Secret under Integrations → API & Webhooks in the Guesty dashboard). Endpoints cover `listings`, `reservations`, `guests`, `tasks`, `webhooks` — raw operational data, not pre-computed KPIs. Guesty's own "Advanced Analytics" (occupancy, benchmarks, business-on-the-books) is a UI feature; per their help center you can view some of it via API but the documented path for real analytics is to replicate raw data into a warehouse (Snowflake/BigQuery/Postgres, e.g. via Portable or dlt connectors) and compute KPIs yourself. Webhooks exist with a monitoring dashboard (OAuth analytics) for delivery/error rates. **Licensing:** Guesty is a paid PMS; API access requires an active account, no public sandbox found.

**Hostaway** — [Public API reference](https://api.hostaway.com/documentation) · [Financial Reporting: Analytics](https://support.hostaway.com/hc/en-us/articles/360061239013-Financial-Reporting-Analytics)
REST + JSON, OAuth2/API key, unified webhooks for `reservation created`, `reservation updated`, `new message received` (configurable in Dashboard → Settings → Integrations, or via the API). No dedicated analytics-export endpoint; their Financial Reporting > Analytics screen computes Rental Revenue, Nights Booked, Occupancy Rate, ADR, and Revenue per Stay from underlying reservation/financial data — the same underlying entities are available over the API, so a custom dashboard reproduces these formulas from `reservations`/`finance` endpoints. **Licensing:** quote-based subscription tiers; API included from "Pro+" per third-party summaries (not confirmed on hostaway.com directly).

**Escapia** (Vrbo/Expedia Group) — [Developer docs](https://developer.escapia.com/Documentation/Escapia)
GraphQL Gateway API at `https://api-gateway.escapia.com/graphql`, OAuth bearer token issued only after a commercial partnership is established with Expedia/Vrbo — not self-serve. Covers property managers, units, rates, pricing engine, booking channels. Legacy batch SOAP/XML feeds (`EVRN...svc`) exist for calendar/content sync, refreshed every ~20 minutes. **Fit for OSEAD:** low — partner-only, no individual developer path; flag as "contact sales" only.

**Track / TrackHS** — [Developer docs](https://developer.trackhs.com/) (via [Airbyte connector docs](https://docs.airbyte.com/integrations/sources/track-pms))
REST API at `https://api.trackhs.com` (or customer subdomain), HTTP Basic Auth with API key/secret issued by a Track admin. Rate limit 10,000 req/5 min. Resources include units, reservations, accounting (accounts/bills/charges/deposits/transactions) — again raw operational/accounting data for you to roll up into KPIs, not a finished analytics feed. Third-party ETL connectors (Airbyte, Coupler.io, dlt) exist, implying no first-party BI export beyond in-app "custom reports & dashboards."

**Beyond** (formerly Beyond Pricing) — [Partners API docs](https://developers.beyondpricing.com/) · [API & MCP product page](https://beyondpricing.com/products/str-developers)
Two auth paths: OAuth2 client credentials for partners (multi-tenant/white-label), or a personal access token (`bpat_…`) for individual users automating their own listings — this PAT path is the most self-serve of any platform in this report. JSON:API format, documented rate limits, signed webhooks instead of polling. Endpoints: listings (with pricing), calendar, users, channel accounts, webhooks. Also ships a production **MCP server** (2026) for AI-agent access to pricing/market/reservation data. **Licensing:** free API access appears tied to being a paying Beyond customer; no published free tier.

**PriceLabs** — [Developer docs](https://developers.pricelabs.co/) · [Customer API listing performance endpoint](https://developers.pricelabs.co/customer-api/api-reference/endpoints/listings/get-listing-performance-metrics)
Customer API authenticated via `X-API-Key` header. Directly relevant endpoints:
- `get_listing_performance_metrics` → occupancy, ADR, revenue, RevPAR, adjusted occupancy, keyed by "Days From Date" (DFD), plus market-level comparison and same-time-last-year figures — this is the closest any vendor comes to a ready-made KPI payload matching OSEAD's `AdminAnalyticsRow` shape.
- `get_neighbourhood_data` / `get_str_index` → competitor/market comps and macro occupancy/RevPAR trends by country/state/region.
CSV export is available in-app for tables/graphs. PriceLabs also ships an MCP tool surface mirroring these endpoints for AI agents. **Fit:** strong — if a real customer connects PriceLabs, this API alone could backfill most of `admin-analytics.ts`'s per-listing occupancy/revenue fields.

**Wheelhouse** — [API docs hub](https://www.usewheelhouse.com/api-docs) · [Revenue Manager API reference](https://api.usewheelhouse.com/wheelhouse_rm_api)
Three tiers: RM API (full read/write, KPIs, reservations, portfolio, audit log — "1:1 parity with the UI"), Pro API (per-listing price recommendations + calendars for PMS/channel-manager integrators), Lite API (fetch a recommendation without onboarding a unit — easiest to test). RM API explicitly exposes "rolling-window KPIs," monthly/quarterly/yearly historical stats per listing. Auth via API key/OAuth (exact mechanism gated behind docs login for full detail). **Fit:** good — KPI + historical-stats endpoints map directly onto occupancy/revenue reporting needs.

### Residential brokerage CRM / analytics

**kvCORE / BoldTrail** (Inside Real Estate) — [Developer Hub](https://developer.insiderealestate.com/)
REST API at `https://api.kvcore.com` (v2), token-based (max 3 tokens/account), covering account/office/team management, listings, contacts, transactions (`/v2/public/transactions`, `/v2/public/transaction/*`). The in-app "Business Analytics" (lead ROI, transaction aging, agent/team performance) is UI-only — third-party summaries confirm there's no dedicated analytics-export endpoint; you'd compute sales-volume/agent-KPI rollups from the transaction and contact endpoints yourself. Manual CSV export exists for contacts via Smart CRM → More Actions → Export (emailed, not API-triggered). **Licensing:** included with kvCORE/BoldTrail subscription; used by 250,000+ agents per third-party sources.

**Follow Up Boss** — [Webhooks guide](https://docs.followupboss.com/reference/webhooks-guide)
REST API + webhooks (`peopleCreated`, `peopleUpdated`, `peopleStageUpdated`, relationship events, etc.). Auth via API key + required `X-System` header; endpoint must ack within 10s or FUB retries for up to 8 hours; signature verification via `FUB-Signature` header. Limit of 2 webhooks per event per system. This is a lead/contact pipeline system — useful for lead-to-close funnel metrics, not a source of sales-volume $ or occupancy data directly.

**Sierra Interactive** — [API docs](https://api.sierrainteractivedev.com/) · [Help center overview](https://help.sierrainteractive.com/helpcenter/unlock-new-opportunities-with-the-sierra-api)
REST API requiring `Sierra-ApiKey` header (and optional `Sierra-OriginatingSystemName` header for webhook correlation). Endpoints: add/update/find leads, retrieve saved listings, find agents, log property views, submit showing/info requests. API availability may depend on subscription plan (per their FAQ); third-party integrations built by request only (`support@sierrainteractive.com`). Lead/listing data, not financial KPIs.

**BoomTown** (Inside Real Estate) — [Developer docs](https://developer.boomtownroi.com/)
REST API, OAuth2 (client ID/secret → access token), endpoints for leads/users/properties/transactions per third-party integration guides (official docs behind a docs portal login wall). SDKs exist for Node, Python, Ruby, PHP, Java, C#, Go via community/partner tooling (Rollout). Same shape as Follow Up Boss/Sierra: pipeline and transaction records, not a KPI feed.

**MoxiWorks (MoxiCloud API)** — [Platform reference](https://moxiworks-platform.github.io/) · [API reference](https://moxiworks-platform.github.io/api.html)
REST + JSON at `https://api.moxiworks.com/`, HTTP Basic Auth using a Platform Identifier/Secret issued only after contacting `partners@moxiworks.com` (no self-serve signup). Also has a separate OAuth2 flow for authenticating individual end-users, and a "Realtime Stream" over AWS SNS for push updates. Covers contacts/agent data across the MoxiWorks suite (MoxiEngage CRM, etc.). **Fit:** lowest priority of the CRMs — partner-gated with no visible fast path.

### Market data / comps

**ATTOM Data** — [Developer platform](https://api.developer.attomdata.com/home) · [Property Data API](https://www.attomdata.com/solutions/delivery/property-data-api/)
Self-serve signup with a free trial API key (30 days), REST returning JSON/XML, covering property details, sales history, AVM ("ATTOMIZED AVM"), owner/mortgage data, schools. No public flat pricing — third-party estimates put basic paid access around $95–500+/month scaling with call volume; enterprise contracts for bulk/cloud delivery (Snowflake). This is comps/valuation enrichment data for CMA-style features, not an ops-analytics feed.

**HouseCanary** — [Data Explorer / API](https://www.housecanary.com/products/data-explorer) · [MCP server post](https://www.housecanary.com/blog/housecanary-mcp-server)
REST API (`api.housecanary.com/v2/...`), key+secret auth, GET for single lookups / POST for batch. Deepest valuation surface of the comps vendors: AVM with confidence scores, sales/rental comps (quantitatively derived, not editorial), 36-month value forecasts at 7 geographic levels, risk/hazard data. As of 2026 also ships an open, `pip install`-able MCP server (149 endpoints) — notably more open in distribution than ATTOM's (hosted, key-gated) or Cotality's (sales-demo-gated) MCP offerings per HouseCanary's own comparison. Pricing not published; "Premium Data Points" called out as extra-fee.

**CoreLogic / Cotality — Trestle** — [Trestle docs](https://trestle-documentation.corelogic.com/) · [WebAPI reference](https://trestle-documentation.corelogic.com/webapi-reference.html)
This is MLS listing-data distribution (RESO-2.0-certified OData API, `$filter`/`$top`/`$skip`/replication semantics), not a general property-data API — access requires an MLS/broker data license, same enterprise-gating pattern as Bridge Interactive. Host migrating to `api.cotality.com` through 2025–2026. Cotality (rebranded from CoreLogic) also has a sales-demo-gated MCP server exposing 4 core data assets (CLIP® property ID, Home Price Index, Property Characteristics). Not realistic for a self-serve template integration.

**Reonomy** — [API getting-started](https://api.reonomy.com/v2/docs/guides/getting-started/)
REST, access-token auth, credit-based usage (one "property detail credit" per property looked up per contract year, one "resolution credit" per address→ID lookup). Covers 54M+ **commercial** properties — ownership/entity resolution, mortgages, sales history. Irrelevant to OSEAD's weekly-rental/residential-sales focus except as a "if we ever add commercial" footnote. Subscriptions start ~$400/month per their marketing page.

**Zillow data (via Bridge Interactive)** — [Bridge API](https://www.bridgeinteractive.com/developers/bridge-api/) · [Bridge platform docs](https://bridgedataoutput.com/docs/platform/)
Zillow shut down its original public API in 2021; the only official route to Zillow-affiliated data (Zestimates, public records) is now Bridge Interactive, a RESO-Platinum-Certified Web API — but it's enterprise/MLS-only, requiring an application, industry credentials (MLS or broker), and approval; not self-serve for an individual developer. Third-party "Zillow API alternative" scrapers exist but are explicitly outside official ToS — **not recommending these** for OSEAD; note honestly that "Zillow Premier Agent analytics" in the consumer sense (agent leaderboard, buyer-side CRM stats) has no public API at all, it's a closed Zillow-side dashboard for paying Premier Agents.

### BI embeds / universal dashboards

**Looker Studio** (Google, free) — [Embed guide via oneuptime.com](https://oneuptime.com/blog/post/2026-02-17-share-embed-looker-studio-reports-web-applications/view)
No management/report API for building reports programmatically — the only integration path is `File → Embed report` → toggle "Enable embedding" → copy the `<iframe src="https://lookerstudio.google.com/embed/reporting/{id}/page/{id}">` snippet. Requires report sharing set to "Anyone with the link can view" for a public, no-login embed (data becomes effectively public, though not search-indexed). Data source refresh depends on connected source (Sheets/BigQuery/etc.), not push-based. Free, zero infra, best "just want a chart on the marketing page" option.

**Metabase** — [Embedding docs](https://www.metabase.com/docs/latest/embedding/introduction)
Open-source (self-hosted, free) or cloud/paid. Guest embeds (signed iframe URLs) work on **all plans including OSS**, with a small OSS-only banner. Full-app embedding and the Modular Embedding SDK (React components, `@metabase/embedding-sdk-react`) require Pro/Enterprise for JWT SSO in production. REST API + connects to Postgres/MySQL/BigQuery/etc. — this is the most realistic self-hosted BI plug-in for a brokerage that already has a data warehouse and wants secure, filterable dashboards rather than a public iframe.

**Power BI** — [Publish to Web docs](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web) · [Embedded usage scenario](https://learn.microsoft.com/en-us/power-bi/guidance/powerbi-implementation-planning-usage-scenario-embed-for-your-customers)
"Publish to Web" produces a fully public iframe with **no authentication and no row-level security** — Microsoft's own docs flag it as unsuitable for confidential/proprietary data, and as of 2026 new embed codes are blocked by default in many tenants. For anything with real per-agent or per-owner numbers, the correct (paid) path is **Power BI Embedded** — capacity-based licensing, app-owns-data pattern via service principal + short-lived embed tokens, full RLS support. Meaningful setup cost; realistic only for a brokerage already on Microsoft/Fabric.

**Tableau Public** — [thebricks.com embed guide](https://www.thebricks.com/resources/guide-how-to-make-tableau-dashboard-public)
Completely free, but "Public" means public: no live data connections (extract-only, manually refreshed by re-publishing from Tableau Public Desktop), and the underlying data is potentially downloadable by anyone who finds the viz. No RLS, no auth. Fine for an evergreen market-trends chart on a blog post; wrong for anything with agent names/$ figures that shouldn't be scraped. Tableau Server/Cloud (paid, per-user) is the private-embedding answer, not covered further here as it's a large licensing commitment for a template project.

## Integration patterns

| Pattern | How it works | Who uses it here | Fits OSEAD's contract? |
| --- | --- | --- | --- |
| **iframe embed** | Vendor hosts the chart; you drop a `<iframe src>` pointing at a public or signed report URL. | Looker Studio, Metabase (guest/static/full-app), Power BI (Publish to Web / Embedded), Tableau Public | No data shape to match — it's a rendered widget, not JSON. Good for a "Reports" tab that shows a vendor-hosted chart alongside the native `AdminAnalytics.svelte` panel, but can't feed `filterAdminRows`/`summarizeRows`. |
| **REST poll** | OSEAD's admin fetches a JSON endpoint on a schedule/on-demand. | Guesty, Hostaway, Track, Beyond, PriceLabs, Wheelhouse, kvCORE, Follow Up Boss, BoomTown, Sierra, ATTOM, HouseCanary, Reonomy, Trestle | **This is exactly `PUBLIC_ADMIN_ANALYTICS_URL`.** A real deployment would run a small serverless function (Cloudflare Worker/Pages Function) that polls the vendor API server-side (keeping the API key off the client), reshapes the response into `AdminAnalyticsPayload`, and serves it at that URL. |
| **Webhook push** | Vendor POSTs an event payload to a URL you register whenever something changes (new reservation, lead stage change). | Hostaway, Guesty, Beyond, Follow Up Boss, BoomTown, Sierra, MoxiWorks (via SNS) | Needs a small receiver (Pages Function) that accumulates/aggregates events into the `AdminAnalyticsPayload` shape and either stores them (KV/D1) or re-serves them at the poll URL above — webhooks alone don't give you historical rollups, just deltas. |
| **File drop / CSV export** | Vendor exports a CSV (manually or on a schedule) that you ingest. | kvCORE (contact export via email), PriceLabs (CSV export of tables/graphs), most PMS "custom reports" | Lowest effort, no auth to manage, but it's manual/batch — best suited for a "paste your export path or point PUBLIC_ADMIN_ANALYTICS_URL at a static JSON file you regenerate from the CSV nightly" workflow, not live data. |
| **Client-side global injection** | Host page sets `window.__OSEAD_ADMIN_ANALYTICS__` before/after the Svelte island mounts. | OSEAD-native today | Best for demos, screenshots, or a parent CMS/dashboard shell that already fetched the data server-side and wants to hand it to the island without a second network round-trip. Not suitable for secrets — the payload is visible in the DOM/JS context. |

## What OSEAD should own first-party vs. plug in

**Own first-party (already correct, keep as-is):**
- The `AdminAnalyticsPayload` shape and the demo-seed generator (`buildDemoAdminAnalytics`) — it mirrors exactly the kind of rollup every vendor above makes you compute yourself (sales volume, rental GMV, occupied/available nights, closed deals, by period/market/employee). No vendor ships this pre-aggregated in a directly-fetchable JSON form, so a first-party seed + a documented "point this at your feed" contract is the right level of ambition.
- The three-tier loader (`window.__OSEAD_ADMIN_ANALYTICS__` → `PUBLIC_ADMIN_ANALYTICS_URL` → demo) — it already covers both the "sync injection" and "REST poll" integration patterns from the table above; that's the correct minimal surface.
- Client-side filtering/summarization (`filterAdminRows`, `summarizeRows`, `employeeSales`) — none of the vendor APIs return pre-filtered-by-range-and-employee data either; this logic has to live somewhere and the browser is fine for demo/small-brokerage data volumes.

**Plug in / document, don't build:**
- A generic "webhook receiver" Pages Function that normalizes Hostaway/Guesty/Beyond/Follow Up Boss webhook payloads into `AdminAnalyticsRow` deltas and republishes them at the `PUBLIC_ADMIN_ANALYTICS_URL` endpoint. Worth a short how-to doc per vendor (start with Hostaway or Beyond — best combination of self-serve API access + webhook docs), but not worth building bespoke SDK wrappers for each vendor in this repo.
- An "embed a report" mode in the admin shell that just iframes a Looker Studio or Metabase guest-embed URL next to the native panels — near-zero code, covers brokers who already have a BI habit, and sidesteps having to reverse-engineer every vendor's KPI math.
- Market/comps data (ATTOM/HouseCanary/Reonomy/Trestle) — explicitly **out of scope** for the admin-analytics feature; that's CMA/comps tooling for a different feature (property page "estimated value" widgets), and every option here is priced per-record or enterprise-gated. Don't wire this up speculatively.

**Do not build:**
- A bespoke OAuth client for any single vendor (Guesty, kvCORE, etc.) inside this template repo — that's an integration project for whoever operates a real brokerage on OSEAD, not a demo-template concern, and every vendor's auth/rate-limit/pagination details are documented well enough (linked above) for a future implementer to follow directly.
- Zillow/Bridge Interactive integration — the public API is dead, the replacement is enterprise/MLS-gated, and third-party scrapers violate ToS. Nothing to build here.

## Sources consulted

All links above are official vendor developer docs where available; secondary sources (integration guides, ETL connector docs, comparison blogs) are cited inline only where they filled a gap (e.g., confirming pricing ranges vendors don't publish, or documenting an API's existence when the primary docs sat behind a login wall).
