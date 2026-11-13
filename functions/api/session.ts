/**
 * Cookie session read — dual-read beside sessionStorage.
 * Unbound OSEAD → 204 (client keeps local demo session only).
 */

import { isKv, readSession } from "../lib/session-kv";

interface SessionEnv {
  OSEAD?: unknown;
}

export async function onRequestGet(context: {
  request: Request;
  env?: SessionEnv;
}): Promise<Response> {
  const kv = context.env?.OSEAD;
  if (!isKv(kv)) {
    return new Response(null, { status: 204 });
  }

  const account = await readSession(kv, context.request);
  if (!account) {
    return new Response(null, { status: 204 });
  }

  return Response.json(account);
}
