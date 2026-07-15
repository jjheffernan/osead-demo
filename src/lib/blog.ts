import type { CollectionEntry } from "astro:content";
import { resolveRoute } from "../i18n/routes";
import type { Locale } from "./site-config";

export type BlogPostEntry = CollectionEntry<"blog">;

/** Flattened, serializable shape for the SSR blog Svelte components. */
export interface BlogPostSummary {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  href: string;
  dateISO: string;
  readingTime: number;
  svgSlug: string;
}

function readingTimeFromBody(body: string | undefined): number {
  return Math.max(
    1,
    Math.ceil((body ?? "").trim().split(/\s+/).filter(Boolean).length / 200),
  );
}

export function toBlogPostSummary(
  post: BlogPostEntry,
  locale: Locale = post.data.locale,
): BlogPostSummary {
  return {
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    author: post.data.author,
    tags: post.data.tags ?? [],
    href: resolveRoute(locale, `/blog/${post.id}`),
    dateISO: new Date(post.data.publishDate).toISOString(),
    readingTime: readingTimeFromBody(post.body),
    svgSlug: post.data.svgSlug ?? post.id,
  };
}

/** Score same-tag posts first; recency breaks ties. Excludes drafts and the current post. */
export function pickRelatedPosts(
  current: BlogPostEntry,
  candidates: BlogPostEntry[],
  limit = 3,
): BlogPostEntry[] {
  const currentTags = new Set(current.data.tags ?? []);
  return candidates
    .filter(
      (entry) =>
        entry.id !== current.id &&
        entry.data.locale === current.data.locale &&
        !entry.data.draft,
    )
    .map((entry) => ({
      entry,
      sharedTagCount: (entry.data.tags ?? []).filter((tag: string) =>
        currentTags.has(tag),
      ).length,
    }))
    .sort(
      (a, b) =>
        b.sharedTagCount - a.sharedTagCount ||
        new Date(b.entry.data.publishDate).getTime() -
          new Date(a.entry.data.publishDate).getTime(),
    )
    .slice(0, limit)
    .map((item) => item.entry);
}
