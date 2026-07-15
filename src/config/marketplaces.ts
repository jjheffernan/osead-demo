/**
 * External marketplace discovery links for the demo.
 * These are outbound references — not live syndication.
 */

export interface MarketplaceLink {
  name: string;
  href: string;
  blurb: string;
}

/** Buy / browse residential marketplaces */
export const buyMarketplaces: MarketplaceLink[] = [
  {
    name: "Zillow",
    href: "https://www.zillow.com/",
    blurb: "Search homes and market context nationwide",
  },
  {
    name: "Redfin",
    href: "https://www.redfin.com/",
    blurb: "Listings, estimates, and tour scheduling",
  },
  {
    name: "Realtor.com",
    href: "https://www.realtor.com/",
    blurb: "MLS-backed residential search",
  },
  {
    name: "Homes.com",
    href: "https://www.homes.com/",
    blurb: "Browse photos, filters, and neighborhood data",
  },
  {
    name: "Compass",
    href: "https://www.compass.com/",
    blurb: "Agent-led luxury and coastal inventory",
  },
];

/** Weekly / short-stay rental platforms */
export const rentMarketplaces: MarketplaceLink[] = [
  {
    name: "Airbnb",
    href: "https://www.airbnb.com/",
    blurb: "Short stays and guest reviews",
  },
  {
    name: "Vrbo",
    href: "https://www.vrbo.com/",
    blurb: "Whole-home coastal weeks",
  },
  {
    name: "Booking.com",
    href: "https://www.booking.com/",
    blurb: "Vacation homes and travel stays",
  },
  {
    name: "Vacasa",
    href: "https://www.vacasa.com/",
    blurb: "Professionally managed beach rentals",
  },
];
