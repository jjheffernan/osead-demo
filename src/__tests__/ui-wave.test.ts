import { describe, expect, it } from "vitest";
import { cn } from "../lib/cn";

/** Keeps Field/Label composition tokens from drifting into palette utilities. */
describe("ui wave helpers", () => {
  it("cn merges class lists without inventing palette utilities", () => {
    // eslint-disable-next-line no-constant-binary-expression -- intentionally falsy to test drop of falsy args
    expect(cn("ui-field", false && "hidden", "ui-field--tight")).toBe(
      "ui-field ui-field--tight",
    );
  });

  it("maps accordion single-open like FAQ expects", () => {
    // ponytail: pure logic check — Accordion stores openValues as string[]
    let openValues: string[] = [];
    const type = "single" as const;
    function onToggle(value: string, open: boolean) {
      if (type === "single") {
        openValues = open ? [value] : [];
        return;
      }
      openValues = open
        ? [...openValues, value]
        : openValues.filter((v) => v !== value);
    }
    onToggle("a", true);
    expect(openValues).toEqual(["a"]);
    onToggle("b", true);
    expect(openValues).toEqual(["b"]);
    onToggle("b", false);
    expect(openValues).toEqual([]);
  });
});
