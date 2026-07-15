import type { APIRoute } from "astro";
import { siteConfig } from "../config/site.config";

export const prerender = true;

interface LlmLink {
  label: string;
  path: string;
  description: string;
}

const corePages: LlmLink[] = [
  { label: "Home", path: "/", description: "Coastal rentals and homes for sale." },
  { label: "Weekly Rentals", path: "/rentals", description: "Weekly coastal stays." },
  { label: "Homes for Sale", path: "/sales", description: "Coastal homes available to buy." },
  { label: "Markets", path: "/markets", description: "Local coastal context and inventory." },
  { label: "Collections", path: "/collections", description: "Intent hubs: oceanfront, pets, large groups, elevators." },
  { label: "Inquire", path: "/contact", description: "Ask about a stay or property." },
  { label: "Journal", path: "/blog", description: "Coastal notes and updates." },
];

const stack: LlmLink[] = [
  { label: "Astro", path: "https://astro.build", description: "Static site generator for fast content sites." },
  { label: "Starlight", path: "https://starlight.astro.build", description: "Documentation framework for Astro." },
  { label: "Cloudflare Pages", path: "https://pages.cloudflare.com", description: "Edge deployment with optional R2 storage." },
];

export const GET: APIRoute = () => {
  const base = siteConfig.url.replace(/\/$/, "");
  const toUrl = (path: string) =>
    path.startsWith("http") ? path : `${base}${path}`;
  const section = (links: LlmLink[]) =>
    links
      .map((l) => `- [${l.label}](${toUrl(l.path)}): ${l.description}`)
      .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.description}. Sample inventory only; inquiries do not create reservations or brokerage transactions.

## Core Pages

${section(corePages)}

## Stack

${section(stack)}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
