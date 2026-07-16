import { describe, expect, it } from "vitest";
import {
  averageRating,
  filterByTarget,
  type TestimonialView,
} from "../lib/testimonials";

const sample: TestimonialView[] = [
  {
    quote: "Great",
    author: "A",
    rating: 5,
    targetType: "business",
    targetId: "osead",
  },
  {
    quote: "Ok",
    author: "B",
    rating: 3,
    targetType: "listing",
    targetId: "x",
  },
];

describe("testimonials helpers", () => {
  it("filters by target", () => {
    const biz = filterByTarget(sample, "business", "osead");
    expect(biz).toHaveLength(1);
    expect(biz[0]?.author).toBe("A");
  });

  it("averages ratings", () => {
    expect(averageRating(filterByTarget(sample, "business", "osead"))).toBe(5);
    expect(averageRating([{ rating: 4 }, { rating: 5 }])).toBe(4.5);
    expect(averageRating([])).toBeNull();
  });
});
