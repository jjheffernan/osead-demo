import { describe, expect, it } from "vitest";
import {
  buildDemoAdminAnalytics,
  employeeSales,
  filterAdminRows,
  parseAdminAnalytics,
  summarizeRows,
} from "../lib/admin-analytics";

describe("admin-analytics", () => {
  const now = new Date("2026-07-16T12:00:00Z");
  const demo = buildDemoAdminAnalytics(now);

  it("builds a full-year demo seed", () => {
    expect(demo.source).toBe("demo");
    expect(demo.rows.length).toBeGreaterThan(100);
  });

  it("filters by season and employee", () => {
    const summer = filterAdminRows(
      demo.rows,
      {
        range: "season",
        season: "summer",
        employeeId: "mara-ellison",
        market: "all",
      },
      now,
    );
    expect(summer.length).toBeGreaterThan(0);
    expect(summer.every((row) => row.season === "summer")).toBe(true);
    expect(summer.every((row) => row.employeeId === "mara-ellison")).toBe(true);
  });

  it("summarizes occupancy and employee sales", () => {
    const ytd = filterAdminRows(
      demo.rows,
      { range: "ytd", season: "all", employeeId: "all", market: "all" },
      now,
    );
    const totals = summarizeRows(ytd);
    expect(totals.availableNights).toBeGreaterThan(0);
    expect(totals.occupancyRate).toBeGreaterThan(0);
    expect(totals.occupancyRate).toBeLessThanOrEqual(1);

    const staff = employeeSales(ytd);
    expect(staff[0]?.salesVolume).toBeGreaterThanOrEqual(
      staff.at(-1)?.salesVolume ?? 0,
    );
  });

  it("accepts an external payload shape", () => {
    const parsed = parseAdminAnalytics({
      source: "external",
      generatedAt: "2026-07-01T00:00:00.000Z",
      rows: [
        {
          period: "2026-06-01",
          season: "summer",
          market: "outer-banks",
          employeeId: "mara-ellison",
          salesVolume: 500000,
          rentalRevenue: 20000,
          occupiedNights: 20,
          availableNights: 30,
          closedDeals: 1,
        },
      ],
    });
    expect(parsed?.source).toBe("external");
    expect(parsed?.rows).toHaveLength(1);
  });
});
