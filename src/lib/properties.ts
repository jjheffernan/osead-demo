import { getCollection, type CollectionEntry } from "astro:content";

export type PropertyEntry = CollectionEntry<"properties">;
export type MarketEntry = CollectionEntry<"markets">;
export type IntentCollectionEntry = CollectionEntry<"collections">;
export type CollectionMatch = IntentCollectionEntry["data"]["match"];

export async function getPublishedProperties(): Promise<PropertyEntry[]> {
  const all = await getCollection("properties");
  return all
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => Number(b.data.featured) - Number(a.data.featured));
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

export async function getMarkets(): Promise<MarketEntry[]> {
  const all = await getCollection("markets");
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getIntentCollections(): Promise<IntentCollectionEntry[]> {
  const all = await getCollection("collections");
  return all.sort((a, b) => a.data.order - b.data.order);
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
      !property.amenities.some((amenity) =>
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

export function propertyPath(property: PropertyEntry): string {
  return `/properties/${property.data.slug}`;
}

export function marketPath(market: MarketEntry): string {
  return `/markets/${market.data.slug}`;
}

export function collectionPath(collection: IntentCollectionEntry): string {
  return `/collections/${collection.data.slug}`;
}
