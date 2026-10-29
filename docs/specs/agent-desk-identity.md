# Agent desk identity

**Status:** implement now  
**Replaces:** the `demoStaff[0]` hardcode in `src/components/account/AgentDesk.svelte`  
**Out of scope:** live Cloudflare deploy, D1, rewriting public PDP staff from the profile override

## Problem

Every agent session renders Mara Ellison’s inbox, posts, and attachments. `staffId` is `demoStaff[0]`. Staff logins (`jonah-reed@osead.demo` and the same pattern for Priya and Cole) already pass `roleForEmail()` as `agent`, then the desk ignores the email.

## Identity rule

Resolve a `demoStaff.id` from the session email:

| Email | `staffId` |
| --- | --- |
| `agent@osead.demo` | `mara-ellison` (demo-button alias only) |
| `{demoStaff.id}@osead.demo` | that id |
| anything else | no staff id; empty inbox, posts, and attachments |

Put this in `staffIdForEmail(email: string): string | undefined` next to `assignmentsForAgent` in `src/config/agent-assignments.ts`. Drop the default argument that silently picks `demoStaff[0]`. Callers pass the resolved id.

`DEMO_AGENT` stays the click-through credential. It is an alias, not a fifth staff row.

## Desk behavior

Key inbox, profile seed, posts (`authorId`), and attached listings off the resolved `staffId`.

| Surface | Rule |
| --- | --- |
| Inbox | `assignmentsForAgent(staffId).inquiries` only |
| Attached | `agentId === staffId` and `attribution !== "anonymous"` |
| Market rotation | same market, and `attribution !== "anonymous"` |
| Posts | `authorId === staffId` |
| Profile seed | `demoStaff` row for `staffId`; localStorage key stays `osead-agent-profile:${email}` |
| Pulse | keep the sales list; add one line `Attached listings: {myAttached.length}` |

Anonymous Saltline Cottage is Outer Banks. It must not appear on Mara’s market rotation.

## Request attach

On each market-rotation row that is not already attached, a button **Request attach**.

- Writes `{ staffId, slug, at }` into `localStorage` key `osead-attach-requests` (array, dedupe by staffId+slug).
- Button label becomes **Requested** and is disabled.
- Does not edit Markdown. Frontmatter stays the SEO source of truth.
- `ponytail:` comment: same-browser only; Phase 5 Function replaces the key.

No admin UI in this slice.

## Posts

Stay read-only. Add a `ponytail:` comment: ContentEditor has no author-scoped write, so `canEditOwnPosts` does not deep-link. Delete the empty `canEditOwnPosts(role) ? "" : ""` splice.

## Profile edits

Still local to the desk. Do not push the override onto the PDP or About page.

## Telemetry

On a successful profile save and on a new attach request, call `track()` from `src/lib/telemetry.ts`:

- `agent.profile_save` with blob `staffId` (no email)
- `agent.attach_request` with blobs `staffId`, `slug`

## Tests

Extend or add a vitest file for `staffIdForEmail` and for anonymous exclusion if that filter is a pure function. One assert that `agent@osead.demo` → `mara-ellison` and `jonah-reed@osead.demo` → `jonah-reed`.

## Acceptance

- `pnpm exec vitest run` covering the new asserts is green.
- Desk code no longer references `demoStaff[0]` as the session identity.
- No new dependencies. No `wrangler.jsonc` change. No commit unless the parent asks.
