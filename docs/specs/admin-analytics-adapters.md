# Admin analytics vendor adapters — worked examples

Doc-only reference for mapping a real vendor payload into one `AdminAnalyticsRow`
(`src/lib/admin-analytics.ts`). No live client, no vendor keys, no comps/AVM
(ATTOM/HouseCanary/Trestle/Reonomy — out of scope). Pair with
`docs/research/admin-analytics-validation-platforms.md` for the full
platform-by-platform audit this is distilled from.

## Target shape

```ts
interface AdminAnalyticsRow {
  period: string;       // "YYYY-MM-01"
  season: Season;
  market: string;
  employeeId: string;
  salesVolume: number;    // closed property sales ($)
  rentalRevenue: number;  // rental GMV ($)
  occupiedNights: number;
  availableNights: number;
  closedDeals: number;
}
```

## Maturity caveats (carry these into any real integration)

- **PriceLabs** `get_listing_performance_metrics` launched **2026-06-30** — a
  ~2-week-old endpoint at time of writing, not a long-stable contract. Costs
  **$1/month per synced listing** and requires **emailing support to enable**
  (not a self-serve API-key toggle).
- **Beyond**'s MCP server ("Neyoba") is **private beta, waitlist-gated** —
  not production access.
- **`market` and `employeeId` are always OSEAD-side joins.** No rental
  vendor (PriceLabs, Beyond, Wheelhouse, Hostaway) has a native concept of
  "market" grouping or sales-agent attribution — both come from an
  OSEAD-maintained listing→market and listing→agent lookup table, not the
  vendor payload.

## Fields no rental vendor can fill

`salesVolume`, `closedDeals`, and `employeeId` stay **0 / unset** from any of
the rental/PMS tools above — they're brokerage-CRM concepts (kvCORE, Follow Up
Boss, BoomTown, Sierra), not something a revenue-management or PMS API
exposes. A rental-only adapter should hardcode these to `0` rather than guess.

---

## Worked example 1: PriceLabs `get_listing_performance_metrics` → row

Vendor response (`GET /v1/listing_metrics?listing_id=...&pms_name=...`),
keyed by **DFD** (days-from-date) buckets, not calendar months:

```json
{
  "listing_id": "104582",
  "pms_name": "hostaway",
  "listing_level": {
    "revenue": { "0": 4180.0, "1": 3920.5, "2": 4610.75 },
    "occupancy": { "0": 0.74, "1": 0.68, "2": 0.81 }
  }
}
```

Adapter mapping — DFD `0` (this month) remapped to `YYYY-MM-01`; occupancy is
a **rate**, so nights are backed out via `occupancy × availableNights`
(available nights isn't returned directly — derive from calendar length,
here a 30-day month):

```ts
const availableNights = 30;
const row: AdminAnalyticsRow = {
  period: "2026-07-01",              // DFD "0" -> current month start
  season: "summer",
  market: marketForListing(listingId),      // OSEAD-side join, not from PriceLabs
  employeeId: agentForListing(listingId),   // OSEAD-side join, not from PriceLabs
  salesVolume: 0,                     // rental-only tool, no property-sales concept
  rentalRevenue: 4180.0,              // listing_level.revenue["0"]
  occupiedNights: Math.round(availableNights * 0.74), // occupancy["0"] x availableNights
  availableNights,
  closedDeals: 0,                     // rental-only tool
};
```

## Worked example 2: Hostaway `finance/report/listingFinancials` CSV → row

`POST /v1/finance/report/listingFinancials` (form-encoded, `format=csv`)
returns **line-item** rows, one per reservation — not a pre-aggregated KPI
feed. One row from the CSV:

```csv
listingMapId,listingName,reservationId,arrivalDate,departureDate,totalPrice,accommodationRevenue,nights
104582,"Oceanfront Cottage",R-88213,2026-07-04,2026-07-11,3850.00,3420.00,7
```

Adapter sums `accommodationRevenue`/`nights` across all reservations for a
listing within the target month, then maps once per listing/month:

```ts
const row: AdminAnalyticsRow = {
  period: "2026-07-01",                       // month bucket you chose when querying fromDate/toDate
  season: "summer",
  market: marketForListing(listingMapId),     // OSEAD-side join, not from Hostaway
  employeeId: agentForListing(listingMapId),  // OSEAD-side join, not from Hostaway
  salesVolume: 0,                             // Hostaway is a PMS, no sales-agent concept
  rentalRevenue: 3420.0,                      // sum of accommodationRevenue for the month
  occupiedNights: 7,                          // sum of nights for the month
  availableNights: 31,                        // calendar days in the month, from /listings/{id}/calendar
  closedDeals: 0,                              // PMS, no CRM deal concept
};
```

## What a real adapter needs beyond this doc

1. Vendor client (OAuth2/API key/PAT per platform) — **not built here**.
2. The OSEAD-side listing→market and listing→agent lookup tables — the one
   piece no vendor can supply.
3. A CSV→row aggregation step for Hostaway (sum line items per listing/month)
   vs. a DFD→month remap for PriceLabs — different shapes, same target row.
