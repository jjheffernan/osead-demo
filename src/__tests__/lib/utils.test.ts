import { describe, it, expect } from "vitest";
import { slugify } from "../../lib/properties";

describe("slugify", () => {
  it("slugifies a plain string", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("strips accents and punctuation", () => {
    expect(slugify("Apa kabar?")).toBe("apa-kabar");
  });

  it("normalizes diacritics", () => {
    expect(slugify("café résumé")).toBe("cafe-resume");
  });
});
