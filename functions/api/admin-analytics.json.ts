/**
 * Outbound admin analytics feed — publishes the demo AdminAnalyticsPayload
 * so a broker's BI/warehouse can poll it. Zero new logic: wraps the existing
 * buildDemoAdminAnalytics() export. A real deploy should gate this behind a
 * bearer token before pointing PUBLIC_ADMIN_ANALYTICS_URL at it.
 */

import { buildDemoAdminAnalytics } from "../../src/lib/admin-analytics";

export async function onRequestGet(): Promise<Response> {
  return Response.json(buildDemoAdminAnalytics());
}
