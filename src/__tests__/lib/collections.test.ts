import { describe, expect, it } from "vitest";
import {
  collectionToFilterQuery,
  propertyMatchesCollection,
} from "../../lib/properties";
import type { PropertyEntry } from "../../lib/properties";

type PropData = PropertyEntry["data"];

function prop(partial: Partial<PropData>): PropData {
  return {
    locale: "en",
    title: "Test",
    description: "Test",
    slug: "test",
    listingType: "rental",
    status: "available",
    featured: false,
    market: "outer-banks",
    town: "Corolla",
    regionLabel: "Outer Banks",
    waterfront: "inland",
    beds: 3,
    baths: 2,
    amenities: [],
    highlights: [],
    images: [],
    draft: false,
    ...partial,
  };
}

describe("propertyMatchesCollection", () => {
  it("matches oceanfront via waterfrontIn", () => {
    expect(
      propertyMatchesCollection(prop({ waterfront: "oceanfront" }), {
        waterfrontIn: ["oceanfront"],
      }),
    ).toBe(true);
    expect(
      propertyMatchesCollection(prop({ waterfront: "oceanview" }), {
        waterfrontIn: ["oceanfront"],
      }),
    ).toBe(false);
  });

  it("matches petsAllowed exactly", () => {
    expect(
      propertyMatchesCollection(prop({ petsAllowed: true }), {
        petsAllowed: true,
      }),
    ).toBe(true);
    expect(
      propertyMatchesCollection(prop({ petsAllowed: false }), {
        petsAllowed: true,
      }),
    ).toBe(false);
    expect(
      propertyMatchesCollection(prop({}), { petsAllowed: true }),
    ).toBe(false);
  });

  it("ANDs minBeds and minSleeps", () => {
    expect(
      propertyMatchesCollection(prop({ beds: 6, sleeps: 14 }), {
        minBeds: 6,
        minSleeps: 14,
      }),
    ).toBe(true);
    expect(
      propertyMatchesCollection(prop({ beds: 6, sleeps: 10 }), {
        minBeds: 6,
        minSleeps: 14,
      }),
    ).toBe(false);
  });

  it("substring-matches elevators case-insensitively", () => {
    expect(
      propertyMatchesCollection(
        prop({ amenities: ["Elevator Building"] }),
        { amenityContains: "Elevator" },
      ),
    ).toBe(true);
    expect(
      propertyMatchesCollection(prop({ amenities: ["Pool"] }), {
        amenityContains: "Elevator",
      }),
    ).toBe(false);
  });

  it("rejects empty match objects", () => {
    expect(propertyMatchesCollection(prop({}), {})).toBe(false);
  });
});

describe("collectionToFilterQuery", () => {
  it("returns empty string when match has nothing filterable", () => {
    expect(collectionToFilterQuery({})).toBe("");
  });

  it("maps waterfront, beds, amenity, and pets into query", () => {
    const qs = collectionToFilterQuery({
      waterfrontIn: ["oceanfront"],
      minBeds: 5,
      amenityContains: "Elevator",
      petsAllowed: true,
    });
    const params = new URLSearchParams(qs.slice(1));
    expect(params.get("waterfront")).toBe("oceanfront");
    expect(params.get("beds")).toBe("5");
    expect(params.get("amenity")).toBe("Elevator");
    expect(params.get("pets")).toBe("1");
  });
});
