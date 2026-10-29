# Account shell keyboard smoke

**Date:** 2026-10-29  
**Kind:** manual, not CI. This is a click-through script, not a test runner.

Sign in on `/login`, then open `/account`. The page hides the site header and footer. The first tab stop is the skip link, then the shell.

## Admin

Landmark is `main#admin-main` (class `admin-shell__main`).

Tab order:

1. Skip link
2. Brand link (O-sea-D)
3. Nav buttons: Overview, Analytics, Content, Access, Site tools
4. Shortcut links: Rentals, Sales, Journal, Contact
5. View site
6. Sign out
7. Theme toggle in the top bar
8. Controls inside the visible panel

The panel `h2` is not a tab stop (`tabindex="-1"`). On a narrow viewport, Menu appears in the top bar before the theme toggle. With the menu open, the backdrop button is `aria-label="Close menu"`. Escape is not required.

Activate each nav button with Enter. Focus lands on that panel’s `h2`:

| Button | Heading |
| --- | --- |
| Overview | Inventory at a glance |
| Analytics | Sales & occupancy |
| Content | Edit Markdown |
| Access | Access & social |
| Site tools | Site walkthrough |

Overview quick actions (Open analytics, Edit Markdown, Site walkthrough, View analytics) use the same switch and land on the same headings.

## Agent

Sign in as `agent@osead.demo`.

`main#agent-main` and focusing the visible `h2` when the panel changes are specified and implemented in the identity slice (`docs/specs/agent-desk-identity.md`, `AgentDesk.svelte`), not in this pass.

Tab order matches the shell shape: brand link, nav buttons (Inbox, My inventory, My posts, Profile), shortcut links (Rentals, Sales, Contact), View site, Sign out, then the main heading and its controls. The theme toggle sits in the top bar before the panel. The mobile backdrop stays `aria-label="Close menu"`. Escape is not required.

Activate each nav button with Enter. Focus should land on that panel’s `h2` (Assigned inquiries, My inventory, My posts, Profile). That focus move belongs to the identity slice.

## Guest

No panel switcher. Do not look for one. The canvas is `main#guest-main` (class `guest-hub container`, `aria-label="Guest account"`). The four blocks inside stay `<section>`.

Tab order:

1. Skip link
2. Links inside Saved homes, then Inquiry history, then My comments, then My ratings (empty-state links when a list is empty; listing links when it is not)
3. Browse rentals
4. Browse sales
5. Message your agent
6. Sign out

The welcome `h1` and the section `h2`s are not tab stops. Nothing moves focus between panels.
