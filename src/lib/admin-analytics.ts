/**
 * Admin ops metrics — sales volume, occupancy, per-employee figures.
 *
 * # ponytail: demo seed until CRM/PMS posts JSON to PUBLIC_ADMIN_ANALYTICS_URL
 *   or window.__OSEAD_ADMIN_ANALYTICS__. Shape is the contract; swap the loader only.
 */

import { demoStaff } from "../config/staff";

export type Season = "winter" | "spring" | "summer" | "fall";
export type RangeKey = "30d" | "90d" | "ytd" | "season";

export interface AdminAnalyticsRow {
  /** Month start YYYY-MM-01 */
  period: string;
  season: Season;
  market: string;
  employeeId: string;
  /** Closed property sales ($) */
  salesVolume: number;
  /** Rental GMV ($) */
  rentalRevenue: number;
  occupiedNights: number;
  availableNights: number;
  closedDeals: number;
}

export interface AdminAnalyticsPayload {
  source: "demo" | "external";
  generatedAt: string;
  currency: "USD";
  rows: AdminAnalyticsRow[];
}

export interface AdminAnalyticsFilters {
  range: RangeKey;
  season: Season | "all";
  employeeId: string | "all";
  market: string | "all";
}

export interface AdminAnalyticsTotals {
  salesVolume: number;
  rentalRevenue: number;
  occupiedNights: number;
  availableNights: number;
  closedDeals: number;
  occupancyRate: number;
}

export interface EmployeeSalesRow {
  employeeId: string;
  name: string;
  role: string;
  salesVolume: number;
  rentalRevenue: number;
  closedDeals: number;
  occupancyRate: number;
}

declare global {
  interface Window {
    /** Optional hydrate: set before/after load from an external system. */
    __OSEAD_ADMIN_ANALYTICS__?: AdminAnalyticsPayload;
  }
}

export const SEASONS: Season[] = ["winter", "spring", "summer", "fall"];
export const MARKETS = [
  "outer-banks",
  "jersey-shore",
  "delaware-beaches",
] as const;

export const DEFAULT_FILTERS: AdminAnalyticsFilters = {
  range: "ytd",
  season: "all",
  employeeId: "all",
  market: "all",
};

function seasonForMonth(monthIndex: number): Season {
  if (monthIndex <= 1 || monthIndex === 11) return "winter";
  if (monthIndex <= 4) return "spring";
  if (monthIndex <= 7) return "summer";
  return "fall";
}

/** Deterministic demo noise so snapshots stay stable in tests. */
function demoUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

export function buildDemoAdminAnalytics(
  now = new Date(),
): AdminAnalyticsPayload {
  const year = now.getFullYear();
  const rows: AdminAnalyticsRow[] = [];

  for (let month = 0; month < 12; month++) {
    const period = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const season = seasonForMonth(month);
    for (const market of MARKETS) {
      for (const staff of demoStaff) {
        const seed = `${period}:${market}:${staff.id}`;
        const u = demoUnit(seed);
        const peak = season === "summer" ? 1.45 : season === "winter" ? 0.55 : 1;
        const salesVolume = Math.round((180_000 + u * 420_000) * peak);
        const rentalRevenue = Math.round((12_000 + u * 38_000) * peak);
        const availableNights = 28 + Math.floor(u * 4);
        const occupiedNights = Math.min(
          availableNights,
          Math.round(availableNights * (0.42 + u * 0.48) * Math.min(peak, 1.2)),
        );
        const closedDeals = u > 0.72 ? 2 : u > 0.38 ? 1 : 0;
        rows.push({
          period,
          season,
          market,
          employeeId: staff.id,
          salesVolume: closedDeals ? salesVolume : Math.round(salesVolume * 0.15),
          rentalRevenue,
          occupiedNights,
          availableNights,
          closedDeals,
        });
      }
    }
  }

  return {
    source: "demo",
    generatedAt: now.toISOString(),
    currency: "USD",
    rows,
  };
}

export function parseAdminAnalytics(value: unknown): AdminAnalyticsPayload | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<AdminAnalyticsPayload>;
  if (!Array.isArray(raw.rows) || raw.rows.length === 0) return null;
  const rows = raw.rows.filter(
    (row): row is AdminAnalyticsRow =>
      !!row &&
      typeof row === "object" &&
      typeof row.period === "string" &&
      typeof row.employeeId === "string" &&
      typeof row.salesVolume === "number" &&
      typeof row.rentalRevenue === "number" &&
      typeof row.occupiedNights === "number" &&
      typeof row.availableNights === "number",
  );
  if (!rows.length) return null;
  return {
    source: raw.source === "external" ? "external" : "demo",
    generatedAt:
      typeof raw.generatedAt === "string"
        ? raw.generatedAt
        : new Date().toISOString(),
    currency: "USD",
    rows,
  };
}

function periodStart(period: string): Date {
  return new Date(`${period}T00:00:00`);
}

function inRange(
  period: string,
  range: RangeKey,
  season: Season | "all",
  now: Date,
): boolean {
  const start = periodStart(period);
  if (Number.isNaN(start.getTime())) return false;

  if (range === "season") {
    return season === "all" || seasonForMonth(start.getMonth()) === season;
  }

  const year = now.getFullYear();
  if (range === "ytd") {
    return start.getFullYear() === year && start <= now;
  }

  const days = range === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return start >= cutoff && start <= now;
}

export function filterAdminRows(
  rows: readonly AdminAnalyticsRow[],
  filters: AdminAnalyticsFilters,
  now = new Date(),
): AdminAnalyticsRow[] {
  return rows.filter((row) => {
    if (!inRange(row.period, filters.range, filters.season, now)) return false;
    if (filters.season !== "all" && row.season !== filters.season) return false;
    if (filters.employeeId !== "all" && row.employeeId !== filters.employeeId) {
      return false;
    }
    if (filters.market !== "all" && row.market !== filters.market) return false;
    return true;
  });
}

export function summarizeRows(
  rows: readonly AdminAnalyticsRow[],
): AdminAnalyticsTotals {
  const totals = rows.reduce(
    (acc, row) => {
      acc.salesVolume += row.salesVolume;
      acc.rentalRevenue += row.rentalRevenue;
      acc.occupiedNights += row.occupiedNights;
      acc.availableNights += row.availableNights;
      acc.closedDeals += row.closedDeals;
      return acc;
    },
    {
      salesVolume: 0,
      rentalRevenue: 0,
      occupiedNights: 0,
      availableNights: 0,
      closedDeals: 0,
      occupancyRate: 0,
    },
  );
  totals.occupancyRate =
    totals.availableNights === 0
      ? 0
      : totals.occupiedNights / totals.availableNights;
  return totals;
}

export function employeeSales(
  rows: readonly AdminAnalyticsRow[],
): EmployeeSalesRow[] {
  const byId = new Map<string, AdminAnalyticsRow[]>();
  for (const row of rows) {
    const list = byId.get(row.employeeId) ?? [];
    list.push(row);
    byId.set(row.employeeId, list);
  }

  return demoStaff
    .map((staff) => {
      const staffRows = byId.get(staff.id) ?? [];
      const totals = summarizeRows(staffRows);
      return {
        employeeId: staff.id,
        name: staff.name,
        role: staff.role,
        salesVolume: totals.salesVolume,
        rentalRevenue: totals.rentalRevenue,
        closedDeals: totals.closedDeals,
        occupancyRate: totals.occupancyRate,
      };
    })
    .filter((row) => row.salesVolume + row.rentalRevenue > 0)
    .sort((a, b) => b.salesVolume - a.salesVolume);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export async function loadAdminAnalytics(
  signal?: AbortSignal,
): Promise<AdminAnalyticsPayload> {
  if (typeof window !== "undefined") {
    const injected = parseAdminAnalytics(window.__OSEAD_ADMIN_ANALYTICS__);
    if (injected) {
      return { ...injected, source: "external" };
    }
  }

  const url = import.meta.env.PUBLIC_ADMIN_ANALYTICS_URL as string | undefined;
  if (url) {
    try {
      const response = await fetch(url, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const parsed = parseAdminAnalytics(await response.json());
        if (parsed) return { ...parsed, source: "external" };
      }
    } catch {
      // Fall through to demo seed.
    }
  }

  return buildDemoAdminAnalytics();
}
