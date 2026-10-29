# NoSQL sessions, analytics document, telemetry

**Status:** implement the code path now. Do not create live KV namespaces or deploy.  
**Supersedes for sessions + broker metrics:** the D1 `sessions` table in `docs/specs/cf-deepen.md`  
**Social rows** (comments, ratings, verified, agent profile overrides) stay on the later D1 list. This slice does not migrate them.

## Why not SQL

Cookies and the broker analytics payload are documents addressed by a key. Event telemetry is a write-only point stream. Neither needs a table.

| Data | Store | Why |
| --- | --- | --- |
| Session | Workers KV | One opaque id → one JSON record, TTL on the key |
| Broker analytics | Same KV namespace, different key | The contract is already one `AdminAnalyticsPayload` JSON document |
| Product events | Workers Analytics Engine | High-cardinality points (`writeDataPoint`). Not a place to store the monthly sales rows |

KV is eventually consistent. A session created in one place can lag at another edge, and revocation is not immediate worldwide. That is acceptable for this demo.

`ponytail:` if login must fail closed on a missing session read, or logout must revoke globally in one request, move the session key to a Durable Object. Do not do that in this slice.

## Bindings (document only)

Do **not** edit `wrangler.jsonc`. Namespace ids are a deploy step, and deploy is skipped. Code must run when the bindings are absent.

```jsonc
"kv_namespaces": [
  { "binding": "OSEAD", "id": "<prod>", "preview_id": "<preview>" }
],
"analytics_engine_datasets": [
  { "binding": "TELEMETRY", "dataset": "osead_events" }
]
```

One namespace. Keys:

| Key | Value |
| --- | --- |
| `session:{id}` | `{ email, name, role, exp }` JSON. `expirationTtl` 7 days |
| `analytics:payload` | `AdminAnalyticsPayload` JSON |

## Cookie

Name `osead_session`. Value is the random id, not the JSON. Flags: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=604800`.

Helper module `functions/lib/session-kv.ts`:

- `createSession(kv, account) → { id, cookie }`
- `readSession(kv, request) → account | null` (missing key, bad JSON, or `exp` in the past → null)
- `clearSessionCookie() → Set-Cookie` that expires the cookie. Best-effort `kv.delete`. Document that delete can lag.

`functions/api/login.ts`: when `context.env.OSEAD` is a KV namespace, set the cookie on the existing `202` JSON response. When it is missing, behavior stays today’s JSON body and the client `sessionStorage` write. Do not remove `sessionStorage`.

Do not put the email in the cookie. Do not log the session id.

## Analytics document

`functions/api/admin-analytics.json.ts` `onRequestGet(context)`:

1. If `env.OSEAD` exists, `get("analytics:payload")`.
2. If the body parses as `AdminAnalyticsPayload`, return it with `source: "external"`.
3. Otherwise return `buildDemoAdminAnalytics()` as today.

No POST writer in this slice. A broker fills the key out of band. The client loader in `src/lib/admin-analytics.ts` stays as it is.

## Telemetry hook

Client: `src/lib/telemetry.ts`

```ts
export function track(name: string, blobs: string[] = []): void
```

`fetch("/api/telemetry", { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ name, blobs }) })`. Swallow all errors. No email, password, or free-text bio.

Server: `functions/api/telemetry.ts` `onRequestPost`.

- Require JSON `{ name: string, blobs?: string[] }`. `name` matches `/^[a-z][a-z0-9._]{0,63}$/`. At most 8 blobs, each truncated to 128 chars.
- If `env.TELEMETRY.writeDataPoint` exists, call it and do not await a query: `blobs: [name, ...blobs]`, `doubles: [1]`, `indexes: [name]`.
- Always `204`. Missing binding is a no-op, not a 500.

Call `track` from the login success path only if it is server-side (`writeDataPoint` directly in `login.ts` for `session.login` with blob = role). The client hook is what AgentDesk uses; do not edit `AgentDesk.svelte` here.

## Tests

Fake KV (`{ get, put, delete }`) in vitest. No Wrangler and no network.

- `createSession` + `readSession` round-trip.
- Expired `exp` returns null.
- Missing KV: login helper is not required to boot Wrangler; a unit test of `readSession` when `get` returns null is enough.
- Telemetry parser rejects a bad name and accepts `session.login`.

## Acceptance

- `pnpm exec vitest run` green for the new tests.
- `pnpm build` still green with no KV id in `wrangler.jsonc`.
- Offline demo login still returns `202` JSON when `OSEAD` is unset.
- No new npm dependency. No D1 migration edit. No commit unless the parent asks.
