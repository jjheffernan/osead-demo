import { describe, expect, it } from "vitest";
import {
  marketRotationListings,
  staffIdForEmail,
} from "../config/agent-assignments";

describe("staffIdForEmail", () => {
  it("maps the demo-button alias and staff inboxes", () => {
    expect(staffIdForEmail("agent@osead.demo")).toBe("mara-ellison");
    expect(staffIdForEmail("jonah-reed@osead.demo")).toBe("jonah-reed");
    expect(staffIdForEmail("priya-santos@osead.demo")).toBe("priya-santos");
    expect(staffIdForEmail("cole-brennan@osead.demo")).toBe("cole-brennan");
  });

  it("returns undefined for any other email", () => {
    expect(staffIdForEmail("guest@example.com")).toBeUndefined();
    expect(staffIdForEmail("not-a-staff@osead.demo")).toBeUndefined();
    expect(staffIdForEmail("")).toBeUndefined();
  });
});

describe("marketRotationListings", () => {
  it("drops anonymous listings in the same market", () => {
    const listings = [
      {
        slug: "saltline-cottage-nags-head",
        market: "outer-banks",
        attribution: "anonymous",
      },
      {
        slug: "dune-crest-corolla",
        market: "outer-banks",
        attribution: "attributed",
      },
      {
        slug: "bayview-row-avalon",
        market: "jersey-shore",
        attribution: "attributed",
      },
    ];

    expect(
      marketRotationListings(listings, "outer-banks").map((listing) => listing.slug),
    ).toEqual(["dune-crest-corolla"]);
    expect(marketRotationListings(listings, undefined)).toEqual([]);
  });
});
