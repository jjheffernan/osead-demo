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

const DEFAULT_STAFF_ID = demoStaff[0]?.id ?? "";

/**
 * Assigned market + inbox for an agent, keyed by `demoStaff` id.
 * Defaults to `demoStaff[0]` (the "sample assigned pulse" agent — the
 * `DEMO_AGENT` seed credential isn't itself in `demoStaff`, per the
 * locked "no name→staff mapping" decision).
 */
export function assignmentsForAgent(staffId: string = DEFAULT_STAFF_ID): {
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
