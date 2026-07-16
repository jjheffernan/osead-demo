/**
 * Content editor API — list/read/save Markdown under src/content/{blog,pages}.
 *
 * Local: Vite plugin handles /api/content during `astro dev`.
 * Pages: optional GitHub Contents API when CONTENT_GITHUB_TOKEN + REPO are set.
 * Requires CONTENT_EDIT_SECRET bearer for mutating requests on Pages.
 */

import {
  contentRelativePath,
  isContentCollection,
  resolveSaveRaw,
  toListItem,
  type ContentCollection,
  type ContentSaveInput,
} from "../../src/lib/content-editor";

interface Env {
  CONTENT_EDIT_SECRET?: string;
  CONTENT_GITHUB_TOKEN?: string;
  CONTENT_GITHUB_REPO?: string;
  CONTENT_GITHUB_BRANCH?: string;
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function unauthorized(): Response {
  return json({ error: "Unauthorized content edit." }, 401);
}

function hasSecret(request: Request, env: Env): boolean {
  const secret = env.CONTENT_EDIT_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("Authorization") ?? "";
  return header === `Bearer ${secret}`;
}

function githubConfigured(env: Env): boolean {
  return Boolean(env.CONTENT_GITHUB_TOKEN?.trim() && env.CONTENT_GITHUB_REPO?.trim());
}

async function githubRequest(
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const repo = env.CONTENT_GITHUB_REPO!.trim();
  const token = env.CONTENT_GITHUB_TOKEN!.trim();
  return fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "osead-content-editor",
      ...(init.headers ?? {}),
    },
  });
}

function decodeBase64(value: string): string {
  return atob(value.replace(/\n/g, ""));
}

function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

async function listGithub(
  env: Env,
  collection: ContentCollection,
): Promise<Response> {
  const branch = env.CONTENT_GITHUB_BRANCH?.trim() || "main";
  const response = await githubRequest(
    env,
    `src/content/${collection}?ref=${encodeURIComponent(branch)}`,
  );
  if (!response.ok) {
    return json(
      { error: `GitHub list failed (${response.status})` },
      response.status,
    );
  }
  const listing = (await response.json()) as Array<{
    name: string;
    type: string;
    path: string;
  }>;
  const items = [];
  for (const entry of listing) {
    if (entry.type !== "file" || !/\.(md|mdx)$/.test(entry.name)) continue;
    const slug = entry.name.replace(/\.(md|mdx)$/, "");
    const fileRes = await githubRequest(
      env,
      `${entry.path}?ref=${encodeURIComponent(branch)}`,
    );
    if (!fileRes.ok) continue;
    const file = (await fileRes.json()) as { content?: string };
    if (!file.content) continue;
    const raw = decodeBase64(file.content);
    items.push(toListItem(collection, slug, raw));
  }
  return json({
    mode: "github",
    items: items.sort((a, b) => a.title.localeCompare(b.title)),
  });
}

async function getGithub(
  env: Env,
  collection: ContentCollection,
  slug: string,
): Promise<Response> {
  const branch = env.CONTENT_GITHUB_BRANCH?.trim() || "main";
  const rel = contentRelativePath(collection, slug);
  const response = await githubRequest(
    env,
    `src/content/${rel}?ref=${encodeURIComponent(branch)}`,
  );
  if (!response.ok) {
    return json({ error: "File not found on GitHub." }, response.status);
  }
  const file = (await response.json()) as { content?: string; sha?: string };
  if (!file.content) return json({ error: "Empty GitHub file." }, 404);
  const raw = decodeBase64(file.content);
  return json({
    mode: "github",
    sha: file.sha,
    ...toListItem(collection, slug, raw),
    raw,
  });
}

async function putGithub(
  env: Env,
  input: ContentSaveInput & { sha?: string },
): Promise<Response> {
  const branch = env.CONTENT_GITHUB_BRANCH?.trim() || "main";
  const raw = resolveSaveRaw(input);
  const rel = contentRelativePath(input.collection, input.slug);
  const path = `src/content/${rel}`;

  let sha = input.sha;
  if (!sha) {
    const existing = await githubRequest(
      env,
      `${path}?ref=${encodeURIComponent(branch)}`,
    );
    if (existing.ok) {
      const body = (await existing.json()) as { sha?: string };
      sha = body.sha;
    }
  }

  const response = await githubRequest(env, path, {
    method: "PUT",
    body: JSON.stringify({
      message: `content: update ${rel}`,
      content: encodeBase64(raw),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    return json(
      { error: `GitHub save failed (${response.status})`, detail },
      response.status,
    );
  }
  return json({
    mode: "github",
    saved: true,
    path: rel,
    rebuild: "Cloudflare Pages will rebuild from this commit.",
    item: toListItem(input.collection, input.slug, raw),
  });
}

async function deleteGithub(
  env: Env,
  collection: ContentCollection,
  slug: string,
): Promise<Response> {
  const branch = env.CONTENT_GITHUB_BRANCH?.trim() || "main";
  const rel = contentRelativePath(collection, slug);
  const path = `src/content/${rel}`;
  const existing = await githubRequest(
    env,
    `${path}?ref=${encodeURIComponent(branch)}`,
  );
  if (!existing.ok) return json({ error: "File not found." }, 404);
  const body = (await existing.json()) as { sha?: string };
  if (!body.sha) return json({ error: "Missing GitHub sha." }, 400);

  const response = await githubRequest(env, path, {
    method: "DELETE",
    body: JSON.stringify({
      message: `content: delete ${rel}`,
      sha: body.sha,
      branch,
    }),
  });
  if (!response.ok) {
    return json({ error: `GitHub delete failed (${response.status})` }, response.status);
  }
  return json({
    mode: "github",
    deleted: true,
    path: rel,
    rebuild: "Cloudflare Pages will rebuild from this commit.",
  });
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const collection = url.searchParams.get("collection") ?? "";
  const slug = url.searchParams.get("slug");

  if (!isContentCollection(collection)) {
    return json({ error: "collection must be blog or pages" }, 400);
  }

  if (!githubConfigured(context.env)) {
    return json(
      {
        error:
          "Remote content API needs CONTENT_GITHUB_TOKEN + CONTENT_GITHUB_REPO. For local editing use `pnpm dev` (Vite writes src/content directly).",
        mode: "unavailable",
      },
      503,
    );
  }

  return slug
    ? getGithub(context.env, collection, slug)
    : listGithub(context.env, collection);
}

export async function onRequestPut(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (!hasSecret(context.request, context.env)) return unauthorized();
  if (!githubConfigured(context.env)) {
    return json(
      {
        error:
          "Saving on Pages requires GitHub credentials. Locally, use `pnpm dev`.",
      },
      503,
    );
  }
  if (!context.request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ error: "Expected JSON body." }, 415);
  }
  let input: ContentSaveInput & { sha?: string };
  try {
    input = (await context.request.json()) as ContentSaveInput & { sha?: string };
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  if (!isContentCollection(input.collection) || !input.slug) {
    return json({ error: "collection and slug required." }, 400);
  }
  try {
    return await putGithub(context.env, input);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Save failed" },
      400,
    );
  }
}

export async function onRequestDelete(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (!hasSecret(context.request, context.env)) return unauthorized();
  if (!githubConfigured(context.env)) {
    return json({ error: "Delete on Pages requires GitHub credentials." }, 503);
  }
  const url = new URL(context.request.url);
  const collection = url.searchParams.get("collection") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  if (!isContentCollection(collection) || !slug) {
    return json({ error: "collection and slug required" }, 400);
  }
  try {
    return await deleteGithub(context.env, collection, slug);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      400,
    );
  }
}
