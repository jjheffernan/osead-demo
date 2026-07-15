import type { CollectionEntry } from "astro:content";
import type {
  RealEstateListing,
  VacationRental,
  WithContext,
} from "schema-dts";

type Property = CollectionEntry<"properties">["data"];

export function buildSaleJsonLd(
  property: Property,
  url: string,
): WithContext<RealEstateListing> | null {
  if (property.listingType === "rental") return null;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url,
    datePosted: new Date().toISOString().slice(0, 10),
    image: property.images.map((image: { src: string }) => image.src),
    ...(property.salePrice
      ? {
          offers: {
            "@type": "Offer",
            price: property.salePrice,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function buildRentalJsonLd(
  property: Property,
  url: string,
): WithContext<VacationRental> | null {
  if (property.listingType === "sale") return null;

  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: property.title,
    description: property.description,
    identifier: property.uid ?? property.slug,
    url,
    image: property.images.map((image: { src: string }) => image.src),
    ...(property.checkInTime ? { checkinTime: property.checkInTime } : {}),
    ...(property.checkOutTime ? { checkoutTime: property.checkOutTime } : {}),
    ...(property.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.geo.lat,
            longitude: property.geo.lng,
          },
        }
      : {}),
    ...(property.address
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: property.address.locality,
            addressRegion: property.address.region,
            postalCode: property.address.postalCode,
            addressCountry: property.address.country,
          },
        }
      : {}),
    containsPlace: {
      "@type": "Accommodation",
      numberOfBedrooms: property.beds,
      numberOfBathroomsTotal: property.baths,
      ...(property.sleeps
        ? {
            occupancy: {
              "@type": "QuantitativeValue",
              value: property.sleeps,
            },
          }
        : {}),
      amenityFeature: property.amenities.map((name: string) => ({
        "@type": "LocationFeatureSpecification",
        name,
        value: true,
      })),
    },
    ...(property.weeklyRate || property.nightlyRate
      ? {
          offers: {
            "@type": "Offer",
            price: property.weeklyRate ?? property.nightlyRate,
            priceCurrency: "USD",
            unitText: property.weeklyRate ? "WEEK" : "NIGHT",
          },
        }
      : {}),
  };
}
