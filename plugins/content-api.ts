/**
 * Dev-only Vite middleware: read/write `src/content/{blog,pages}` at `/api/content`.
 * Mirrors the Pages Function contract so the admin UI works under `pnpm dev`.
 */
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";
import {
  contentRelativePath,
  isContentCollection,
  resolveSaveRaw,
  toListItem,
  type ContentCollection,
  type ContentSaveInput,
} from "../src/lib/content-editor";

const CONTENT_ROOT = join(process.cwd(), "src", "content");

async function readJson(req: import("http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function send(
  res: import("http").ServerResponse,
  status: number,
  body: unknown,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function listCollection(collection: ContentCollection) {
  const dir = join(CONTENT_ROOT, collection);
  const names = await readdir(dir);
  const items = [];
  for (const name of names) {
    if (!name.endsWith(".md") && !name.endsWith(".mdx")) continue;
    const slug = name.replace(/\.(md|mdx)$/, "");
    const raw = await readFile(join(dir, name), "utf8");
    items.push(toListItem(collection, slug, raw));
  }
  return items.sort((a, b) => a.title.localeCompare(b.title));
}

export function contentApiPlugin(): Plugin {
  return {
    name: "osead-content-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://localhost") : null;
        if (!url || !url.pathname.startsWith("/api/content")) return next();

        try {
          if (req.method === "GET" && url.pathname === "/api/content") {
            const collection = url.searchParams.get("collection") ?? "";
            const slug = url.searchParams.get("slug");
            if (!isContentCollection(collection)) {
              return send(res, 400, {
                error: "collection must be blog or pages",
              });
            }
            if (!slug) {
              return send(res, 200, {
                mode: "local",
                items: await listCollection(collection),
              });
            }
            const rel = contentRelativePath(collection, slug);
            const absolute = join(CONTENT_ROOT, rel);
            const raw = await readFile(absolute, "utf8");
            return send(res, 200, {
              mode: "local",
              ...toListItem(collection, slug, raw),
              raw,
            });
          }

          if (req.method === "PUT" && url.pathname === "/api/content") {
            const input = (await readJson(req)) as ContentSaveInput;
            if (!input || !isContentCollection(input.collection)) {
              return send(res, 400, { error: "Invalid content payload." });
            }
            const raw = resolveSaveRaw(input);
            const rel = contentRelativePath(input.collection, input.slug);
            const absolute = join(CONTENT_ROOT, rel);
            await mkdir(dirname(absolute), { recursive: true });
            await writeFile(absolute, raw, "utf8");
            return send(res, 200, {
              mode: "local",
              saved: true,
              path: rel,
              item: toListItem(input.collection, input.slug, raw),
            });
          }

          if (req.method === "DELETE" && url.pathname === "/api/content") {
            const collection = url.searchParams.get("collection") ?? "";
            const slug = url.searchParams.get("slug") ?? "";
            if (!isContentCollection(collection) || !slug) {
              return send(res, 400, { error: "collection and slug required" });
            }
            const rel = contentRelativePath(collection, slug);
            await unlink(join(CONTENT_ROOT, rel));
            return send(res, 200, { mode: "local", deleted: true, path: rel });
          }

          return send(res, 405, { error: "Method not allowed" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Content API error";
          const status = message.includes("ENOENT") ? 404 : 400;
          return send(res, status, { error: message });
        }
      });
    },
  };
}
