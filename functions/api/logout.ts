/**
 * Clear osead_session cookie. Best-effort KV delete when bound.
 */

import { clearSessionCookie, isKv } from "../lib/session-kv";

interface LogoutEnv {
  OSEAD?: unknown;
}

export async function onRequestPost(context: {
  request: Request;
  env?: LogoutEnv;
}): Promise<Response> {
  const kv = context.env?.OSEAD;
  const cookie = await clearSessionCookie(
    isKv(kv) ? kv : undefined,
    context.request,
  );
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": cookie },
  });
}
