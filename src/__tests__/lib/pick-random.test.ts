import { describe, expect, it } from "vitest";
import { pickRandom } from "../../lib/properties";

describe("pickRandom", () => {
  it("returns at most n items from the pool", () => {
    const pool = [1, 2, 3, 4, 5, 6];
    const picked = pickRandom(pool, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const item of picked) expect(pool).toContain(item);
  });

  it("returns the whole pool when n is larger", () => {
    expect(pickRandom(["a", "b"], 5)).toHaveLength(2);
  });
});
