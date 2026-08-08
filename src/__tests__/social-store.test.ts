import { describe, expect, it } from "vitest";
import {
  SOCIAL_KEY,
  addComment,
  addRating,
  isVerifiedClient,
  readComments,
  readRatings,
  setVerifiedClient,
  socialCounts,
} from "../lib/social-store";

describe("social-store", () => {
  it("round-trips comments and ratings", () => {
    const store = new Map<string, string>();
    viLocal(store);

    addComment({
      targetId: "saltline-cottage-nags-head",
      body: "Quiet dunes.",
      authorName: "Ada",
      authorEmail: "ada@example.com",
    });
    addRating({
      targetType: "listing",
      targetId: "saltline-cottage-nags-head",
      rating: 5,
      authorName: "Ada",
      authorEmail: "ada@example.com",
      quote: "Loved it",
    });

    expect(readComments("saltline-cottage-nags-head")).toHaveLength(1);
    expect(readRatings("saltline-cottage-nags-head")[0]?.rating).toBe(5);
    expect(store.has(SOCIAL_KEY)).toBe(true);
    expect(socialCounts()).toEqual({ comments: 1, ratings: 1, verified: 0 });
  });

  it("toggles verified client by email", () => {
    const store = new Map<string, string>();
    viLocal(store);

    expect(isVerifiedClient("Ada@Example.com")).toBe(false);
    setVerifiedClient("Ada@Example.com", true);
    expect(isVerifiedClient("ada@example.com")).toBe(true);
    setVerifiedClient("ada@example.com", false);
    expect(isVerifiedClient("ada@example.com")).toBe(false);
  });
});

function viLocal(store: Map<string, string>) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
  });
}
