import { describe, expect, it } from "vitest";
import {
  INQUIRIES_KEY,
  SAVED_LISTINGS_KEY,
  addInquiry,
  isSaved,
  readInquiries,
  readSavedListings,
  toggleSavedListing,
} from "../lib/guest-store";

describe("guest-store", () => {
  it("toggles a saved listing on and off, persisting across reads", () => {
    const store = new Map<string, string>();
    viLocal(store);

    expect(isSaved("dune-house")).toBe(false);

    expect(toggleSavedListing("dune-house")).toBe(true);
    expect(readSavedListings()).toEqual(["dune-house"]);
    expect(isSaved("dune-house")).toBe(true);
    expect(store.has(SAVED_LISTINGS_KEY)).toBe(true);

    expect(toggleSavedListing("dune-house")).toBe(false);
    expect(readSavedListings()).toEqual([]);
    expect(isSaved("dune-house")).toBe(false);
  });

  it("appends and persists an inquiry round-trip", () => {
    const store = new Map<string, string>();
    viLocal(store);

    expect(readInquiries()).toEqual([]);

    const inquiry = addInquiry({
      propertySlug: "dune-house",
      intent: "booking-inquiry",
      checkIn: "2026-08-01",
      checkOut: "2026-08-08",
    });

    expect(inquiry.submittedAt).toMatch(/^\d{4}-/);
    expect(store.has(INQUIRIES_KEY)).toBe(true);

    const read = readInquiries();
    expect(read).toHaveLength(1);
    expect(read[0]).toEqual(inquiry);

    addInquiry({ propertySlug: "surf-cottage", intent: "booking-inquiry" });
    expect(readInquiries()).toHaveLength(2);
    expect(readInquiries()[1].propertySlug).toBe("surf-cottage");
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
