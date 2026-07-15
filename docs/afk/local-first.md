## Local-first AFK policy (operator)

- Default Sources: `todo-md` section **Now** (`priority: todo-first`).
- Do **not** open GitHub PRs unless the operator asks — GH PR create is HITL-gated.
- Outcome: branch `after-hours/<slice>` → commit → **merge locally into `main`** → push `main` when possible.
- Prefer **one subagent per vertical slice** (conception → integration). Parent orchestrator merges and check-off TODO.
- Cap: **10 completed slices** or **10 hours** from `startedAt`, whichever first.
- Stop phrases: `stop after-hours`, `stop loop`.
