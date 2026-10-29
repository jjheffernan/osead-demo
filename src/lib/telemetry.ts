/** Fire-and-forget product events. Server no-ops when TELEMETRY is unbound. */

export function track(name: string, blobs: string[] = []): void {
	if (typeof fetch === "undefined") return;
	void fetch("/api/telemetry", {
		method: "POST",
		keepalive: true,
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ name, blobs }),
	}).catch(() => {});
}
