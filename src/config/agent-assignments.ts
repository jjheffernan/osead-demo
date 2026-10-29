/**
 * Static agent assignment config — the lightest "assigned inventory" seam.
 * A plain array + map, not a schema field or DB: demo inquiry fixtures and
 * a per-agent market are both "assigned via market rotation" over the ids
 * that already exist in `staff.ts`, using the `market` enum every property
 * already has.
 */

import type { CollectionEntry } from "astro:content";
import { demoStaff } from "./staff";

type Market = CollectionEntry<"properties">["data"]["market"];

const MARKET_ROTATION: Market[] = [
  "outer-banks",
  "jersey-shore",
  "delaware-beaches",
  "other-coastal",
];

/** `demoStaff` id -> assigned market, one per agent via rotation over `MARKET_ROTATION`. */
export const agentMarkets: Record<string, Market> = Object.fromEntries(
  demoStaff.map((staff, index) => [
    staff.id,
    MARKET_ROTATION[index % MARKET_ROTATION.length],
  ]),
);

export interface AssignedInquiry {
  propertySlug: string;
  intent: string;
  checkIn?: string;
  checkOut?: string;
  submittedAt: string;
  /** `demoStaff` id this fixture rotated to. */
  staffId: string;
}

/** Demo inquiry fixtures, assigned via market rotation to `demoStaff` ids. */
export const assignedInquiries: AssignedInquiry[] = [
  {
    propertySlug: "dune-crest-corolla",
    intent: "booking-inquiry",
    checkIn: "2026-07-04",
    checkOut: "2026-07-11",
    submittedAt: "2026-06-02T14:30:00.000Z",
    staffId: "mara-ellison",
  },
  {
    propertySlug: "saltline-cottage-nags-head",
    intent: "rent",
    submittedAt: "2026-06-10T09:15:00.000Z",
    staffId: "mara-ellison",
  },
  {
    propertySlug: "bayview-row-avalon",
    intent: "booking-inquiry",
    checkIn: "2026-08-01",
    checkOut: "2026-08-08",
    submittedAt: "2026-06-05T11:00:00.000Z",
    staffId: "jonah-reed",
  },
  {
    propertySlug: "dune-road-lbi",
    intent: "sale",
    submittedAt: "2026-06-12T16:45:00.000Z",
    staffId: "jonah-reed",
  },
  {
    propertySlug: "harbor-watch-dewey",
    intent: "booking-inquiry",
    checkIn: "2026-07-18",
    checkOut: "2026-07-25",
    submittedAt: "2026-06-08T10:20:00.000Z",
    staffId: "priya-santos",
  },
  {
    propertySlug: "cedar-point-rehoboth",
    intent: "rent",
    submittedAt: "2026-06-14T13:05:00.000Z",
    staffId: "priya-santos",
  },
];

/** Click-through credential. Alias for Mara, not a fifth `demoStaff` row. */
const DEMO_AGENT_EMAIL = "agent@osead.demo";
const DEMO_AGENT_STAFF_ID = "mara-ellison";

/**
 * `demoStaff` id for a session email.
 * `agent@osead.demo` is the demo-button alias only.
 */
export function staffIdForEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_AGENT_EMAIL) {
    return demoStaff.some((staff) => staff.id === DEMO_AGENT_STAFF_ID)
      ? DEMO_AGENT_STAFF_ID
      : undefined;
  }
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return undefined;
  const id = normalized.slice(0, at);
  if (normalized.slice(at + 1) !== "osead.demo") return undefined;
  return demoStaff.some((staff) => staff.id === id) ? id : undefined;
}

/**
 * Assigned market + inbox for one `demoStaff` id.
 * Callers pass the id from `staffIdForEmail` — no silent roster default.
 */
export function assignmentsForAgent(staffId: string): {
  market: Market | undefined;
  inquiries: AssignedInquiry[];
} {
  return {
    market: agentMarkets[staffId],
    inquiries: assignedInquiries.filter(
      (inquiry) => inquiry.staffId === staffId,
    ),
  };
}

/** Same market, excluding brand-only `attribution: anonymous` listings. */
export function marketRotationListings<
  T extends { market: string; attribution?: string },
>(listings: readonly T[], market: string | undefined): T[] {
  if (!market) return [];
  return listings.filter(
    (listing) =>
      listing.market === market && listing.attribution !== "anonymous",
  );
}
