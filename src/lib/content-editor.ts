/**
 * Shared contract for admin Markdown editing (blog + pages).
 *
 * # ponytail: local FS via Vite in `astro dev`; GitHub Contents API when
 *   CONTENT_GITHUB_* is set on Pages. Static sites cannot mutate `src/content`
 *   on Cloudflare without a git commit → automatic Pages rebuild.
 */

export const CONTENT_COLLECTIONS = ["blog", "pages"] as const;
export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

export interface ContentListItem {
  collection: ContentCollection;
  slug: string;
  path: string;
  title: string;
  draft?: boolean;
}

export interface ContentDocument {
  collection: ContentCollection;
  slug: string;
  path: string;
  /** Raw file including frontmatter */
  raw: string;
  /** Body after frontmatter */
  body: string;
  /** Parsed scalar/array frontmatter (best-effort) */
  data: Record<string, unknown>;
}

export interface ContentSaveInput {
  collection: ContentCollection;
  slug: string;
  /** Full raw markdown file, or fields for blog guided save */
  raw?: string;
  title?: string;
  description?: string;
  body?: string;
  draft?: boolean;
  tags?: string[];
  author?: string;
  locale?: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isContentCollection(value: string): value is ContentCollection {
  return (CONTENT_COLLECTIONS as readonly string[]).includes(value);
}

export function slugifyTitle(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function assertSafeSlug(slug: string): string {
  const normalized = slugifyTitle(slug);
  if (!normalized || !SLUG_RE.test(normalized)) {
    throw new Error("Slug must be lowercase letters, numbers, and hyphens.");
  }
  return normalized;
}

export function contentRelativePath(
  collection: ContentCollection,
  slug: string,
): string {
  return `${collection}/${assertSafeSlug(slug)}.md`;
}

/** Split `---\\n fm \\n---\\n body`. */
export function splitMarkdown(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: raw };
  return { frontmatter: match[1], body: match[2].replace(/^\r?\n/, "") };
}

/** Best-effort YAML-ish parse for admin forms (scalars + simple string lists). */
export function parseFrontmatter(frontmatter: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  let listKey: string | null = null;

  for (const line of frontmatter.split(/\r?\n/)) {
    if (/^\s*-\s+/.test(line) && listKey) {
      const item = line.replace(/^\s*-\s+/, "").replace(/^["']|["']$/g, "");
      const existing = data[listKey];
      if (Array.isArray(existing)) existing.push(item);
      else data[listKey] = [item];
      continue;
    }
    listKey = null;
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1];
    const rawValue = pair[2].trim();
    if (rawValue === "" || rawValue === "|" || rawValue === ">") {
      listKey = key;
      data[key] = [];
      continue;
    }
    if (rawValue === "true") data[key] = true;
    else if (rawValue === "false") data[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(rawValue)) data[key] = Number(rawValue);
    else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((part) => part.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
  return data;
}

export function yamlScalar(value: unknown): string {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  const text = String(value ?? "");
  if (/[:#{}[\],&*?|>!%@`]/.test(text) || text.includes("\n")) {
    return JSON.stringify(text);
  }
  return text.includes(" ") ? JSON.stringify(text) : text;
}

export function buildBlogMarkdown(input: {
  title: string;
  description: string;
  body: string;
  draft?: boolean;
  tags?: string[];
  author?: string;
  locale?: string;
  publishDate?: string;
  translationKey?: string;
}): string {
  const tags = input.tags?.length ? input.tags : [];
  const publishDate =
    input.publishDate ?? new Date().toISOString().slice(0, 10);
  const lines = [
    "---",
    `title: ${yamlScalar(input.title)}`,
    `description: ${yamlScalar(input.description)}`,
    `locale: ${yamlScalar(input.locale ?? "en")}`,
    `publishDate: ${publishDate}`,
    `draft: ${input.draft ? "true" : "false"}`,
    "tags:",
    ...tags.map((tag) => `  - ${yamlScalar(tag)}`),
    `author: ${yamlScalar(input.author ?? "O-sea-D")}`,
    `translationKey: ${yamlScalar(input.translationKey ?? slugifyTitle(input.title))}`,
    "---",
    "",
    input.body.trim(),
    "",
  ];
  return lines.join("\n");
}

export function toListItem(
  collection: ContentCollection,
  slug: string,
  raw: string,
): ContentListItem {
  const { frontmatter } = splitMarkdown(raw);
  const data = parseFrontmatter(frontmatter);
  return {
    collection,
    slug,
    path: contentRelativePath(collection, slug),
    title: typeof data.title === "string" ? data.title : slug,
    draft: data.draft === true,
  };
}

export function resolveSaveRaw(input: ContentSaveInput): string {
  if (typeof input.raw === "string" && input.raw.trim()) {
    return input.raw.replace(/\r\n/g, "\n");
  }
  if (input.collection !== "blog") {
    throw new Error("Pages saves require full raw Markdown (including frontmatter).");
  }
  if (!input.title?.trim() || !input.description?.trim()) {
    throw new Error("Blog posts need a title and description.");
  }
  return buildBlogMarkdown({
    title: input.title.trim(),
    description: input.description.trim(),
    body: input.body ?? "",
    draft: input.draft,
    tags: input.tags,
    author: input.author,
    locale: input.locale,
  });
}
