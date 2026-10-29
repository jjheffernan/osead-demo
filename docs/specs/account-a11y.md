# Account shell keyboard pass

**Status:** implement now  
**MVP item:** keyboard-usable account shells  
**Out of scope:** Lighthouse CI, live deploy, AgentDesk identity (owned by `docs/specs/agent-desk-identity.md`)

## Landmark

These shells render a sidebar plus a canvas and have no `<main>`:

- `src/components/account/AdminShell.svelte` — `div.admin-shell__main`
- `src/components/account/GuestHub.svelte` — root wrapper around the guest canvas
- Do **not** edit `AgentDesk.svelte` in this slice. The identity slice wraps `div.agent-desk__main` as `<main>`.

Change the canvas wrapper to `<main>` and keep the existing class so CSS does not move. Give each main an `id` (`admin-main`, `guest-main`, and the identity slice uses `agent-main`).

## Panel changes move focus

When a shell switches panels (admin nav, guest has a single canvas), focus the visible `h2` inside that panel. The heading needs `tabindex="-1"` so `.focus()` works without adding a tab stop.

AgentDesk’s `setPanel` gets the same treatment in the identity slice, not here.

## Keyboard

Nav controls are already `<button>` or `<a>`. Do not add a roving-tabindex widget. Tab order is: brand link, nav buttons, shortcut links, sign out, then the main heading and its controls.

Document that order in `docs/research/access-a11y-smoke.md` for admin, agent, and guest. Note the agent heading focus is specified in the identity spec and implemented there.

## Smoke doc contents

Short manual script, not a test runner:

1. Sign in as admin, agent (`agent@osead.demo`), and a guest.
2. Tab from the logo through sign out into the main heading.
3. Activate each nav button with Enter. Focus lands on that panel’s `h2`.
4. Escape is not required. The mobile backdrop button stays `aria-label="Close menu"`.
5. Record date and “manual, not CI”.

## Acceptance

- Admin and guest canvas wrappers are `<main>`.
- Admin panel switch focuses the panel `h2`.
- `docs/research/access-a11y-smoke.md` exists.
- No new dependencies. Do not edit `AgentDesk.svelte`, `wrangler.jsonc`, or package files. No commit unless the parent asks.
