import { describe, expect, it, vi } from "vitest";
import {
  onRequestPost,
  parseTelemetry,
} from "../../functions/api/telemetry";

describe("telemetry name parser", () => {
  it("rejects a bad name and accepts session.login", () => {
    expect(parseTelemetry({ name: "Session.login" })).toBeNull();
    expect(parseTelemetry({ name: "session login" })).toBeNull();
    expect(parseTelemetry({ name: "" })).toBeNull();
    expect(parseTelemetry({ name: "session.login" })).toEqual({
      name: "session.login",
      blobs: [],
    });
    expect(
      parseTelemetry({ name: "session.login", blobs: ["agent"] }),
    ).toEqual({ name: "session.login", blobs: ["agent"] });
  });
});

describe("telemetry Pages Function", () => {
  it("writes a point and returns 204", async () => {
    const writeDataPoint = vi.fn();
    const response = await onRequestPost({
      request: new Request("https://osead.example/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "session.login", blobs: ["agent"] }),
      }),
      env: { TELEMETRY: { writeDataPoint } },
    });

    expect(response.status).toBe(204);
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    expect(writeDataPoint).toHaveBeenCalledWith({
      blobs: ["session.login", "agent"],
      doubles: [1],
      indexes: ["session.login"],
    });
  });

  it("returns 204 and does not write when the name is bad or TELEMETRY is missing", async () => {
    const writeDataPoint = vi.fn();
    const bad = await onRequestPost({
      request: new Request("https://osead.example/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Nope" }),
      }),
      env: { TELEMETRY: { writeDataPoint } },
    });
    const missing = await onRequestPost({
      request: new Request("https://osead.example/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "session.login" }),
      }),
    });

    expect(bad.status).toBe(204);
    expect(missing.status).toBe(204);
    expect(writeDataPoint).not.toHaveBeenCalled();
  });
});
