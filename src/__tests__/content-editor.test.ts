import { describe, expect, it } from "vitest";
import {
  assertSafeSlug,
  buildBlogMarkdown,
  parseFrontmatter,
  resolveSaveRaw,
  slugifyTitle,
  splitMarkdown,
} from "../lib/content-editor";

describe("content-editor", () => {
  it("slugifies titles safely", () => {
    expect(slugifyTitle("Outer Banks Ocean Week!")).toBe(
      "outer-banks-ocean-week",
    );
    expect(assertSafeSlug("good-slug")).toBe("good-slug");
    expect(() => assertSafeSlug("!!!")).toThrow();
  });

  it("round-trips blog markdown fields", () => {
    const raw = buildBlogMarkdown({
      title: "Coastal light",
      description: "A short note",
      body: "## Hello\n\nWorld",
      draft: true,
      tags: ["rentals", "obx"],
      author: "Mara",
    });
    const { frontmatter, body } = splitMarkdown(raw);
    const data = parseFrontmatter(frontmatter);
    expect(data.title).toBe("Coastal light");
    expect(data.draft).toBe(true);
    expect(data.tags).toEqual(["rentals", "obx"]);
    expect(body).toContain("## Hello");
  });

  it("resolveSaveRaw builds from guided blog fields", () => {
    const raw = resolveSaveRaw({
      collection: "blog",
      slug: "test-post",
      title: "Test",
      description: "Desc",
      body: "Body",
    });
    expect(raw.startsWith("---")).toBe(true);
    expect(raw).toContain("title: Test");
  });
});
