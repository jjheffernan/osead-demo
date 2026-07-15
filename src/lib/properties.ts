import { getCollection, type CollectionEntry } from "astro:content";

export type PropertyEntry = CollectionEntry<"properties">;
export type MarketEntry = CollectionEntry<"markets">;

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

export function propertyPath(property: PropertyEntry): string {
  return `/properties/${property.data.slug}`;
}

export function marketPath(market: MarketEntry): string {
  return `/markets/${market.data.slug}`;
}
