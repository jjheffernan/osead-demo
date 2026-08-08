/** Browser-only social persistence — CF D1 swap target (see docs/specs/cf-deepen.md). */

export const SOCIAL_KEY = "osead-social";

export interface SocialComment {
  id: string;
  targetType: "listing";
  targetId: string;
  body: string;
  authorName: string;
  authorEmail: string;
  at: string;
}

export interface SocialRating {
  id: string;
  targetType: string;
  targetId: string;
  rating: number;
  authorName: string;
  authorEmail: string;
  quote?: string;
  at: string;
}

interface SocialStore {
  comments: SocialComment[];
  ratings: SocialRating[];
  verifiedEmails: string[];
}

const empty = (): SocialStore => ({
  comments: [],
  ratings: [],
  verifiedEmails: [],
});

function readStore(): SocialStore {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<SocialStore>;
    return {
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      ratings: Array.isArray(parsed.ratings) ? parsed.ratings : [],
      verifiedEmails: Array.isArray(parsed.verifiedEmails)
        ? parsed.verifiedEmails.filter((e) => typeof e === "string")
        : [],
    };
  } catch {
    return empty();
  }
}

function writeStore(store: SocialStore): void {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(store));
}

function id(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readComments(targetId?: string): SocialComment[] {
  const all = readStore().comments;
  return targetId
    ? all.filter((c) => c.targetId === targetId)
    : all;
}

export function addComment(
  input: Omit<SocialComment, "id" | "at" | "targetType"> & {
    targetType?: "listing";
  },
): SocialComment {
  const comment: SocialComment = {
    id: id(),
    targetType: "listing",
    targetId: input.targetId,
    body: input.body,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    at: new Date().toISOString(),
  };
  const store = readStore();
  store.comments = [...store.comments, comment];
  writeStore(store);
  return comment;
}

export function readRatings(targetId?: string): SocialRating[] {
  const all = readStore().ratings;
  return targetId
    ? all.filter((r) => r.targetId === targetId)
    : all;
}

export function addRating(
  input: Omit<SocialRating, "id" | "at">,
): SocialRating {
  const rating: SocialRating = {
    ...input,
    id: id(),
    at: new Date().toISOString(),
  };
  const store = readStore();
  store.ratings = [...store.ratings, rating];
  writeStore(store);
  return rating;
}

export function isVerifiedClient(email: string): boolean {
  return readStore().verifiedEmails.includes(email.trim().toLowerCase());
}

export function setVerifiedClient(email: string, verified: boolean): boolean {
  const normalized = email.trim().toLowerCase();
  const store = readStore();
  const has = store.verifiedEmails.includes(normalized);
  if (verified && !has) store.verifiedEmails = [...store.verifiedEmails, normalized];
  if (!verified && has) {
    store.verifiedEmails = store.verifiedEmails.filter((e) => e !== normalized);
  }
  writeStore(store);
  return verified;
}

export function readVerifiedEmails(): string[] {
  return readStore().verifiedEmails;
}

export function socialCounts(): { comments: number; ratings: number; verified: number } {
  const store = readStore();
  return {
    comments: store.comments.length,
    ratings: store.ratings.length,
    verified: store.verifiedEmails.length,
  };
}
