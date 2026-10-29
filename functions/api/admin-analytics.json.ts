/**
 * Admin analytics feed. When OSEAD is bound, GET returns the
 * `analytics:payload` document with source "external". Otherwise the demo seed.
 * A broker fills the key out of band; there is no POST writer in this slice.
 */

import {
  buildDemoAdminAnalytics,
  parseAdminAnalytics,
} from "../../src/lib/admin-analytics";

interface AnalyticsEnv {
  OSEAD?: {
    get(key: string): Promise<string | null>;
  };
}

export async function onRequestGet(
  context: { env?: AnalyticsEnv } = {},
): Promise<Response> {
  const kv = context.env?.OSEAD;
  if (kv && typeof kv.get === "function") {
    try {
      const raw = await kv.get("analytics:payload");
      if (typeof raw === "string" && raw) {
        const parsed = parseAdminAnalytics(JSON.parse(raw));
        if (parsed) return Response.json({ ...parsed, source: "external" });
      }
    } catch {
      // unreadable document → demo payload
    }
  }
  return Response.json(buildDemoAdminAnalytics());
}
