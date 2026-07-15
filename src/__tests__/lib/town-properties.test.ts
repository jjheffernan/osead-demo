import { describe, expect, it } from "vitest";
import {
  filterPropertiesByTown,
  type PropertyEntry,
} from "../../lib/properties";

type PropData = PropertyEntry["data"];

function entry(
  partial: Partial<PropData> & Pick<PropData, "slug" | "town" | "market">,
): PropertyEntry {
  return {
    id: partial.slug,
    collection: "properties",
    data: {
      locale: "en",
      title: partial.title ?? partial.slug,
      description: "Test",
      listingType: "rental",
      status: "available",
      featured: false,
      regionLabel: "Test",
      waterfront: "inland",
      beds: 3,
      baths: 2,
      amenities: [],
      highlights: [],
      images: [],
      draft: false,
      ...partial,
    },
  } as PropertyEntry;
}

describe("filterPropertiesByTown", () => {
  const pool = [
    entry({ slug: "a", market: "outer-banks", town: "Corolla" }),
    entry({ slug: "b", market: "outer-banks", town: "Duck" }),
    entry({ slug: "c", market: "jersey-shore", town: "Corolla" }),
  ];

  it("keeps exact market + town matches", () => {
    expect(
      filterPropertiesByTown(pool, "outer-banks", "Corolla").map(
        (p) => p.data.slug,
      ),
    ).toEqual(["a"]);
  });

  it("returns empty when town has no listings", () => {
    expect(filterPropertiesByTown(pool, "outer-banks", "Avon")).toEqual([]);
  });
});
