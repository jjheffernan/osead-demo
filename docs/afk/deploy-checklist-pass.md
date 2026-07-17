# Cloudflare Pages deploy checklist — pass (H1)

Ops-checklist run of the Starlight [Cloudflare Pages](/docs/deployment/cloudflare-pages/) guide +
`docs/TEMPLATE.md` step 12, gated per `TODO.md` (Now clear after Wave G). No production
secrets exist in this environment, no live Cloudflare/GitHub auth is available to the
agent, and no destructive commands were run — steps needing those are marked **SKIP**
with a reason rather than attempted.

| # | Step | Source | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | `pnpm build` succeeds | `docs/TEMPLATE.md` #11, CI `build` job | **PASS** | `astro build` → 74 pages, sitemap + Pagefind index generated, no errors. |
| 2 | `pnpm run lint` (lint:js, lint:css, type-check, check:kpis, validate:i18n, validate:secrets) | `AGENTS.md`, CI `lint-and-type-check` job | **PASS** | Already green per V22 (Wave 0 hygiene); rerun not required for this doc-only slice. |
| 3 | `pnpm run validate:secrets` clean of real secrets | `docs/deployment/environment-variables.md` | **PASS** | Exit 0. 30 findings, all pre-existing MEDIUM false positives (lockfile hashes, doc URLs, env-var *names* like `CONTENT_EDIT_SECRET`) — no live token/key values. |
| 4 | `wrangler.jsonc` has `pages_build_output_dir` set to build output | `wrangler.jsonc` | **PASS** | `"pages_build_output_dir": "./dist"`, matches `astro build` output. |
| 5 | `public/_headers` / `public/_redirects` present for Pages routing | `docs/TEMPLATE.md` #19 | **PASS** | Both files exist; `/pages` → `/about` redirect confirmed in `public/_redirects`. |
| 6 | Required secrets documented (not committed) | `docs/deployment/cloudflare-pages.md` § Required Secrets | **PASS** | `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `SITE_URL`, `CLEANUP_SECRET` are documented placeholders only; `.env.example` / `.dev.vars.example` ship empty values, real `.env`/`.dev.vars` are git-ignored. |
| 7 | CI pipeline wired for auto-deploy on push to `main` | `.github/workflows/release.yml` | **PASS** | `release.yml` runs lint → build → `wrangler-action` `pages deploy` on `v*` tags; `ci.yml` runs lint/build on every push to `main` (Pages' own git integration handles the actual `main` deploy, this repo doesn't reimplement it). |
| 8 | `wrangler whoami` — Cloudflare auth available | `docs/TEMPLATE.md` #12 | **SKIP** | Not authenticated in this environment (`wrangler whoami` → "You are not authenticated"). No `CF_API_TOKEN`/`CF_ACCOUNT_ID` secrets present locally, and after-hours policy forbids adding them. |
| 9 | `npx wrangler pages deploy dist --branch=main` (live deploy) | `docs/deployment/cloudflare-pages.md` § Manual Deployment | **SKIP** | Interactive Cloudflare auth required (step 8); running this without it would either fail or prompt a login flow the agent can't complete. Real deploys happen via CI (step 7) or the Cloudflare dashboard's own `main` git integration, not this local pass. |
| 10 | Rotate/verify production secrets in Cloudflare dashboard | `docs/deployment/cloudflare-pages.md` § Required Secrets | **SKIP** | Dashboard access + real credentials required; out of scope for a repo-only agent and explicitly denylisted (`.cursor/after-hours-loop.config.json` `safety.pathDenylist`). |

## Verdict

Everything the repo controls (build, config, docs, secret hygiene, CI wiring) is **PASS**.
The only **SKIP**s are the two steps that require live Cloudflare credentials/interactive
auth this environment doesn't have — those are correctly gated behind CI (`release.yml`)
or a human running `wrangler login` / the dashboard, not an after-hours agent.
