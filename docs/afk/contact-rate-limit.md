# Contact inquiry rate limit (V17)

`functions/api/contact.ts` applies a **demo-friendly** sliding-window limit:

| Setting | Value |
|---------|--------|
| Window | 60 seconds |
| Max accepted attempts | 5 per client IP |
| Storage | In-memory `Map` (per Cloudflare isolate) |
| Client key | `CF-Connecting-IP`, else first `X-Forwarded-For` hop, else `unknown` |
| Over-limit response | `429` + `{ "error": "Too many inquiries…" }` |

Rate limiting runs after the JSON `Content-Type` check and before body parse / honeypot / validation. Honeypot rejection and thank-you (`202` + `{ accepted: true }`) from V16 are unchanged.

**Ceiling:** isolate-local only — cold starts reset the window; traffic across isolates is not coordinated. For production multi-isolate hardening, use Cloudflare Rate Limiting rules or shared KV / Durable Object state.
