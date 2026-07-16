import { getCollection, type CollectionEntry } from "astro:content";

export type PropertyEntry = CollectionEntry<"properties">;

/** Town/path slug for Astro static paths and market URLs. */
export function slugify(str: string) {
  return str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type MarketEntry = CollectionEntry<"markets">;
export type IntentCollectionEntry = CollectionEntry<"collections">;
export type CollectionMatch = IntentCollectionEntry["data"]["match"];

export async function getPublishedProperties(): Promise<PropertyEntry[]> {
  const all = await getCollection("properties");
  return all
    .filter((entry: PropertyEntry) => !entry.data.draft)
    .sort(
      (a: PropertyEntry, b: PropertyEntry) =>
        Number(b.data.featured) - Number(a.data.featured),
    );
}

export async function getPropertiesByListingType(
  listingType: "sale" | "rental",
): Promise<PropertyEntry[]> {
  const all = await getPublishedProperties();
  return all.filter(
    (entry) =>
      entry.data.listingType === listingType ||
      entry.data.listingType === "both",
  );
}

export async function getPropertiesByMarket(
  market: PropertyEntry["data"]["market"],
): Promise<PropertyEntry[]> {
  const all = await getPublishedProperties();
  return all.filter((entry) => entry.data.market === market);
}

/** Exact town + market match on published listings (drafts already excluded). */
export function filterPropertiesByTown(
  properties: PropertyEntry[],
  market: PropertyEntry["data"]["market"],
  town: string,
): PropertyEntry[] {
  return properties.filter(
    (entry) => entry.data.market === market && entry.data.town === town,
  );
}

export async function getPropertiesByTown(
  market: PropertyEntry["data"]["market"],
  town: string,
): Promise<PropertyEntry[]> {
  return filterPropertiesByTown(await getPublishedProperties(), market, town);
}

export async function getMarkets(): Promise<MarketEntry[]> {
  const all = await getCollection("markets");
  return all.sort(
    (a: MarketEntry, b: MarketEntry) => a.data.order - b.data.order,
  );
}

export async function getIntentCollections(): Promise<IntentCollectionEntry[]> {
  const all = await getCollection("collections");
  return all.sort(
    (a: IntentCollectionEntry, b: IntentCollectionEntry) =>
      a.data.order - b.data.order,
  );
}

/** AND across present match keys; vacuous match (no keys) matches nothing. */
export function propertyMatchesCollection(
  property: PropertyEntry["data"],
  match: CollectionMatch,
): boolean {
  const keys = Object.keys(match).filter(
    (key) => match[key as keyof CollectionMatch] !== undefined,
  );
  if (keys.length === 0) return false;

  if (
    match.waterfrontIn &&
    !match.waterfrontIn.includes(property.waterfront)
  ) {
    return false;
  }
  if (
    match.petsAllowed !== undefined &&
    property.petsAllowed !== match.petsAllowed
  ) {
    return false;
  }
  if (match.minBeds !== undefined && property.beds < match.minBeds) {
    return false;
  }
  if (match.minSleeps !== undefined) {
    if (property.sleeps === undefined || property.sleeps < match.minSleeps) {
      return false;
    }
  }
  if (match.amenityContains) {
    const needle = match.amenityContains.toLowerCase();
    if (
      !property.amenities.some((amenity: string) =>
        amenity.toLowerCase().includes(needle),
      )
    ) {
      return false;
    }
  }
  return true;
}

export async function getPropertiesForCollection(
  match: CollectionMatch,
): Promise<PropertyEntry[]> {
  const all = await getPublishedProperties();
  return all.filter((entry) => propertyMatchesCollection(entry.data, match));
}

/** Score same market/waterfront first; featured breaks ties. Pads with other published if needed. */
export function pickRelatedProperties(
  current: PropertyEntry,
  candidates: PropertyEntry[],
  limit = 3,
): PropertyEntry[] {
  const affinity = (entry: PropertyEntry) =>
    Number(entry.data.market === current.data.market) +
    Number(entry.data.waterfront === current.data.waterfront);

  return candidates
    .filter(
      (entry) =>
        entry.data.slug !== current.data.slug && !entry.data.draft,
    )
    .sort(
      (a, b) =>
        affinity(b) - affinity(a) ||
        Number(b.data.featured) - Number(a.data.featured),
    )
    .slice(0, limit);
}

export async function getRelatedProperties(
  current: PropertyEntry,
  limit = 3,
): Promise<PropertyEntry[]> {
  return pickRelatedProperties(
    current,
    await getPublishedProperties(),
    limit,
  );
}

export function propertyPath(property: PropertyEntry): string {
  return `/properties/${property.data.slug}`;
}

/** Flattened, serializable shape for the SSR PropertyCard.svelte component. */
export interface PropertyCardData {
  href: string;
  title: string;
  regionLabel: string;
  beds: number;
  baths: number;
  sleeps?: number;
  waterfront: PropertyEntry["data"]["waterfront"];
  priceDisplay?: string;
  image?: { src: string; alt: string };
}

export function toPropertyCardProps(property: PropertyEntry): PropertyCardData {
  const { data } = property;
  return {
    href: propertyPath(property),
    title: data.title,
    regionLabel: data.regionLabel,
    beds: data.beds,
    baths: data.baths,
    sleeps: data.sleeps,
    waterfront: data.waterfront,
    priceDisplay: data.priceDisplay,
    image: data.images[0],
  };
}

export function marketPath(market: MarketEntry): string {
  return `/markets/${market.data.slug}`;
}

export function townPath(market: MarketEntry, town: string): string {
  return `/markets/${market.data.slug}/${slugify(town)}`;
}

export function collectionPath(collection: IntentCollectionEntry): string {
  return `/collections/${collection.data.slug}`;
}
