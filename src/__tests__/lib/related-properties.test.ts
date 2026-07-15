import { describe, expect, it } from "vitest";
import {
  pickRelatedProperties,
  type PropertyEntry,
} from "../../lib/properties";

type PropData = PropertyEntry["data"];

function entry(
  partial: Partial<PropData> & Pick<PropData, "slug">,
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
    },
  } as PropertyEntry;
}

describe("pickRelatedProperties", () => {
  const current = entry({
    slug: "current",
    market: "jersey-shore",
    waterfront: "oceanview",
  });

  it("skips current slug and drafts", () => {
    const related = pickRelatedProperties(current, [
      current,
      entry({ slug: "drafty", market: "jersey-shore", draft: true }),
      entry({ slug: "keeper", market: "jersey-shore" }),
    ]);
    expect(related.map((p) => p.data.slug)).toEqual(["keeper"]);
  });

  it("prefers same market/waterfront, then featured", () => {
    const related = pickRelatedProperties(current, [
      entry({
        slug: "other-market",
        market: "outer-banks",
        waterfront: "bayfront",
        featured: true,
      }),
      entry({
        slug: "same-water",
        market: "delaware-beaches",
        waterfront: "oceanview",
      }),
      entry({
        slug: "same-market",
        market: "jersey-shore",
        waterfront: "bayfront",
      }),
      entry({
        slug: "both-featured",
        market: "jersey-shore",
        waterfront: "oceanview",
        featured: true,
      }),
      entry({
        slug: "both",
        market: "jersey-shore",
        waterfront: "oceanview",
      }),
    ]);
    expect(related.map((p) => p.data.slug).slice(0, 2)).toEqual([
      "both-featured",
      "both",
    ]);
    expect(["same-market", "same-water"]).toContain(related[2]?.data.slug);
    expect(related.some((p) => p.data.slug === "other-market")).toBe(false);
  });

  it("returns at most three", () => {
    const pool = Array.from({ length: 6 }, (_, i) =>
      entry({ slug: `p-${i}`, market: "jersey-shore" }),
    );
    expect(pickRelatedProperties(current, pool)).toHaveLength(3);
  });
});
