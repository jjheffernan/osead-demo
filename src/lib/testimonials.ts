import { getCollection, type CollectionEntry } from "astro:content";

export type TestimonialEntry = CollectionEntry<"testimonials">;
export type TestimonialTarget = TestimonialEntry["data"]["targetType"];

export interface TestimonialView {
  quote: string;
  author: string;
  rating: number;
  targetType: TestimonialTarget;
  targetId: string;
}

export function toTestimonialView(entry: TestimonialEntry): TestimonialView {
  const { quote, author, rating, targetType, targetId } = entry.data;
  return { quote, author, rating, targetType, targetId };
}

export function filterByTarget(
  items: TestimonialView[],
  targetType: TestimonialTarget,
  targetId: string,
): TestimonialView[] {
  return items.filter(
    (item) => item.targetType === targetType && item.targetId === targetId,
  );
}

export function filterTestimonials(
  entries: TestimonialEntry[],
  targetType: TestimonialTarget,
  targetId: string,
  locale = "en",
): TestimonialView[] {
  return filterByTarget(
    entries
      .filter((e) => e.data.locale === locale)
      .map(toTestimonialView),
    targetType,
    targetId,
  );
}

export function averageRating(items: { rating: number }[]): number | null {
  if (items.length === 0) return null;
  const sum = items.reduce((acc, item) => acc + item.rating, 0);
  return Math.round((sum / items.length) * 10) / 10;
}

export async function getTestimonialsFor(
  targetType: TestimonialTarget,
  targetId: string,
  locale = "en",
): Promise<TestimonialView[]> {
  const all = await getCollection("testimonials");
  return filterTestimonials(all, targetType, targetId, locale);
}
