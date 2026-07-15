## Local-first AFK policy (operator)

- Default Sources: `todo-md` section **Now** (`priority: todo-first`).
- Do **not** open GitHub PRs unless the operator asks — GH PR create is HITL-gated.
- Outcome: branch `after-hours/<slice>` → commit → **merge locally into `main`** → push `main` when possible.
- Prefer **one subagent per vertical slice** (conception → integration). Parent orchestrator merges and check-off TODO.
- Cap: **10 completed slices** or **10 hours** from `startedAt`, whichever first.
- Stop phrases: `stop after-hours`, `stop loop`.

## Commit discipline (required)

- **Commit between ticks.** Never leave a dirty tree across a 10m wake.
- Mid-slice: create `wip(after-hours): …` checkpoint commits if work is incomplete.
- End of slice: final non-`wip` commit(s), `pnpm build` green, TODO `- [x]`, then local merge to `main`.
- Before starting the next claim: `git status` must be clean on `main` (or only intentional docs/state updates).
- Sentinel / parent must refuse a new slice while uncommitted changes remain — checkpoint or stash-recover first.
