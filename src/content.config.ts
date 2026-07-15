import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";

// Add locale codes here (e.g. ["en", "id"]) when introducing new languages.
const localeSchema = z.enum(["en"]);

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: localeSchema,
    publishDate: z.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string().default("Admin"),
    authorId: z.string().optional(),
    uid: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    toc: z.boolean().optional(),
    svgSlug: z.string().optional(),
    translationKey: z.string().optional(),
  }),
});

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
});

const pageSectionSchema = z.object({
  type: z.enum(["hero", "cta", "features", "faq", "trust"]),
  title: z.string().optional(),
  content: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .optional(),
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    sections: z.array(pageSectionSchema).default([]),
    isLegal: z.boolean().default(false),
    order: z.number().default(0),
    translationKey: z.string().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/content/authors",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
  }),
});

const settings = defineCollection({
  loader: glob({
    pattern: "settings.yml",
    base: "./src/content",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    defaultLocale: localeSchema.default("en"),
    analyticsProvider: z.enum(["none", "gtm", "umami"]).default("none"),
    gtmId: z.string().optional(),
    umamiUrl: z.string().optional(),
    umamiId: z.string().optional(),
    mapLatitude: z.string().optional(),
    mapLongitude: z.string().optional(),
    orgName: z.string().optional(),
    orgEmail: z.string().optional(),
  }),
});

const waterFrontSchema = z.enum([
  "oceanfront",
  "semi-oceanfront",
  "oceanview",
  "soundfront",
  "bayfront",
  "canal",
  "inland",
]);

const marketSchema = z.enum([
  "outer-banks",
  "jersey-shore",
  "delaware-beaches",
  "other-coastal",
]);

const properties = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/properties",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    /** sale | rental | both */
    listingType: z.enum(["sale", "rental", "both"]),
    status: z
      .enum(["available", "pending", "sold", "booked", "coming-soon"])
      .default("available"),
    featured: z.boolean().default(false),
    market: marketSchema,
    town: z.string(),
    regionLabel: z.string(),
    waterfront: waterFrontSchema,
    beds: z.number().int().positive(),
    baths: z.number().positive(),
    sleeps: z.number().int().positive().optional(),
    sqft: z.number().int().positive().optional(),
    lotSqft: z.number().int().positive().optional(),
    yearBuilt: z.number().int().optional(),
    /** Sale price in USD; omit for rental-only */
    salePrice: z.number().positive().optional(),
    /** Weekly rental rate in USD; omit for sale-only */
    weeklyRate: z.number().positive().optional(),
    nightlyRate: z.number().positive().optional(),
    priceDisplay: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    highlights: z.array(z.string()).default([]),
    images: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
        }),
      )
      .default([]),
    geo: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    address: z
      .object({
        street: z.string().optional(),
        locality: z.string(),
        region: z.string(),
        postalCode: z.string().optional(),
        country: z.string().default("US"),
      })
      .optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    petsAllowed: z.boolean().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    draft: z.boolean().default(false),
    uid: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  }),
});

const markets = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/markets",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    market: marketSchema,
    heroImage: z.string().optional(),
    towns: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().default(0),
  }),
});

/** Intent hubs (SEO collections) — filter properties via structured match rules. */
const collectionMatchSchema = z.object({
  /** Property waterfront value must be one of these */
  waterfrontIn: z.array(waterFrontSchema).optional(),
  /** Exact petsAllowed match when set */
  petsAllowed: z.boolean().optional(),
  /** beds >= minBeds */
  minBeds: z.number().int().positive().optional(),
  /** sleeps >= minSleeps (properties without sleeps fail this clause) */
  minSleeps: z.number().int().positive().optional(),
  /** Case-insensitive substring match against any amenity string */
  amenityContains: z.string().min(1).optional(),
});

const intentCollections = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/collections",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    /** Human-readable matching rules (also enforced via `match`) */
    matchNotes: z.string(),
    match: collectionMatchSchema,
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  blog,
  docs,
  pages,
  settings,
  authors,
  properties,
  markets,
  collections: intentCollections,
};
