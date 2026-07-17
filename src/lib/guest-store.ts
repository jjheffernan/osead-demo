/** Browser-only guest persistence: saved listings + a local inquiry mirror. */

export const SAVED_LISTINGS_KEY = "osead-saved-listings";
export const INQUIRIES_KEY = "osead-inquiries";

export interface Inquiry {
  propertySlug: string;
  intent: string;
  checkIn?: string;
  checkOut?: string;
  submittedAt: string;
}

// ponytail: same localStorage-mirror seam as demo-account.ts — a real backend
// would replace these reads/writes without touching call sites.
export function readSavedListings(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_LISTINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function isSaved(slug: string): boolean {
  return readSavedListings().includes(slug);
}

export function toggleSavedListing(slug: string): boolean {
  const saved = readSavedListings();
  const next = saved.includes(slug)
    ? saved.filter((s) => s !== slug)
    : [...saved, slug];
  localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(next));
  return next.includes(slug);
}

export function readInquiries(): Inquiry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(INQUIRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Inquiry[]) : [];
  } catch {
    return [];
  }
}

export function addInquiry(record: Omit<Inquiry, "submittedAt">): Inquiry {
  const inquiry: Inquiry = { ...record, submittedAt: new Date().toISOString() };
  localStorage.setItem(
    INQUIRIES_KEY,
    JSON.stringify([...readInquiries(), inquiry]),
  );
  return inquiry;
}
