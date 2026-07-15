# Create GitHub issues for after-hours

Run when you are ready to queue AFK work (creates label + issues on `jjheffernan/osead-demo`):

```bash
gh label create ready-for-agent --description "AFK after-hours queue" --color 0E8A16 || true

gh issue create --title "A2: Listing filters Svelte island" --label ready-for-agent --body-file docs/afk/issues/A2.md
gh issue create --title "A1: Property gallery Svelte island" --label ready-for-agent --body-file docs/afk/issues/A1.md
gh issue create --title "B1: Collections content type for SEO intent pages" --label ready-for-agent --body-file docs/afk/issues/B1.md
```

Issue bodies live in `docs/afk/issues/`. Full backlog: [backlog.md](./backlog.md).
