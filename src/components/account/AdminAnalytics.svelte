<script lang="ts">
	import { onMount } from "svelte";
	import {
		DEFAULT_FILTERS,
		MARKETS,
		SEASONS,
		employeeSales,
		filterAdminRows,
		formatPct,
		formatUsd,
		loadAdminAnalytics,
		summarizeRows,
		type AdminAnalyticsFilters,
		type AdminAnalyticsPayload,
		type RangeKey,
		type Season,
	} from "../../lib/admin-analytics";
import { demoStaff } from "../../config/staff";
import Field from "../ui/form/Field/Field.svelte";
import Label from "../ui/form/Label/Label.svelte";
import SalesSparkline from "./SalesSparkline.svelte";

	let payload = $state<AdminAnalyticsPayload | null>(null);
	let status = $state<"loading" | "ready" | "error">("loading");
	let error = $state("");
	let filters = $state<AdminAnalyticsFilters>({ ...DEFAULT_FILTERS });

	const filtered = $derived(
		payload ? filterAdminRows(payload.rows, filters) : [],
	);
	const totals = $derived(summarizeRows(filtered));
	const byEmployee = $derived(employeeSales(filtered));
	const monthlySales = $derived(
		Array.from(
			filtered
				.reduce((byPeriod, row) => {
					byPeriod.set(row.period, (byPeriod.get(row.period) ?? 0) + row.salesVolume);
					return byPeriod;
				}, new Map<string, number>())
				.entries(),
		)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([period, value]) => ({ period, value })),
	);

	async function hydrate() {
		status = "loading";
		error = "";
		try {
			payload = await loadAdminAnalytics();
			status = "ready";
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to load analytics.";
			status = "error";
		}
	}

	onMount(() => {
		void hydrate();
	});
</script>

<section class="admin-analytics" aria-labelledby="admin-analytics-title">
	<header class="admin-analytics__head">
		<div>
			<p class="admin-analytics__eyebrow">Operations</p>
			<h2 id="admin-analytics-title">Sales & occupancy</h2>
			<p class="admin-analytics__lede">
				Demo seed by default. Hydrate from
				<code>PUBLIC_ADMIN_ANALYTICS_URL</code>
				or
				<code>window.__OSEAD_ADMIN_ANALYTICS__</code>.
			</p>
		</div>
		<div class="admin-analytics__source">
			<span data-source={payload?.source ?? "demo"}>
				{payload?.source === "external" ? "External feed" : "Demo seed"}
			</span>
			<button type="button" onclick={hydrate} disabled={status === "loading"}>
				{status === "loading" ? "Loading…" : "Refresh"}
			</button>
		</div>
	</header>

	<form class="admin-analytics__filters" onsubmit={(e) => e.preventDefault()}>
		<Field>
			<Label for="admin-range">Time range</Label>
			<select
				id="admin-range"
				value={filters.range}
				onchange={(e) =>
					(filters = {
						...filters,
						range: e.currentTarget.value as RangeKey,
					})}
			>
				<option value="30d">Last 30 days</option>
				<option value="90d">Last 90 days</option>
				<option value="ytd">Year to date</option>
				<option value="season">Season view</option>
			</select>
		</Field>

		<Field>
			<Label for="admin-season">Season</Label>
			<select
				id="admin-season"
				value={filters.season}
				onchange={(e) =>
					(filters = {
						...filters,
						season: e.currentTarget.value as Season | "all",
					})}
			>
				<option value="all">All seasons</option>
				{#each SEASONS as season}
					<option value={season}>{season}</option>
				{/each}
			</select>
		</Field>

		<Field>
			<Label for="admin-employee">Employee</Label>
			<select
				id="admin-employee"
				value={filters.employeeId}
				onchange={(e) =>
					(filters = { ...filters, employeeId: e.currentTarget.value })}
			>
				<option value="all">All employees</option>
				{#each demoStaff as staff}
					<option value={staff.id}>{staff.name}</option>
				{/each}
			</select>
		</Field>

		<Field>
			<Label for="admin-market">Market</Label>
			<select
				id="admin-market"
				value={filters.market}
				onchange={(e) =>
					(filters = { ...filters, market: e.currentTarget.value })}
			>
				<option value="all">All markets</option>
				{#each MARKETS as market}
					<option value={market}>{market.replaceAll("-", " ")}</option>
				{/each}
			</select>
		</Field>
	</form>

	{#if status === "error"}
		<p class="admin-analytics__error" role="alert">{error}</p>
	{:else}
		<div class="admin-analytics__kpis" aria-live="polite">
			<div class="admin-analytics__kpi">
				<span class="admin-analytics__kpi-label">Sales volume</span>
				<strong>{formatUsd(totals.salesVolume)}</strong>
				<span class="admin-analytics__kpi-meta"
					>{totals.closedDeals} closed deals</span
				>
			</div>
			<div class="admin-analytics__kpi">
				<span class="admin-analytics__kpi-label">Occupancy</span>
				<strong>{formatPct(totals.occupancyRate)}</strong>
				<span class="admin-analytics__kpi-meta"
					>{totals.occupiedNights} / {totals.availableNights} nights</span
				>
			</div>
			<div class="admin-analytics__kpi">
				<span class="admin-analytics__kpi-label">Rental revenue</span>
				<strong>{formatUsd(totals.rentalRevenue)}</strong>
				<span class="admin-analytics__kpi-meta">Filtered window</span>
			</div>
		</div>

		<div class="admin-analytics__occupancy" aria-hidden="true">
			<div
				class="admin-analytics__occupancy-fill"
				style={`width: ${Math.min(100, Math.round(totals.occupancyRate * 100))}%`}
			></div>
		</div>

		<section class="admin-analytics__trend" aria-labelledby="admin-trend-title">
			<h3 id="admin-trend-title">Sales trend</h3>
			<SalesSparkline points={monthlySales} label="Monthly sales volume" />
		</section>

		<section class="admin-analytics__employees" aria-labelledby="admin-emp-title">
			<h3 id="admin-emp-title">Employee sales</h3>
			{#if byEmployee.length === 0}
				<p class="admin-analytics__empty">No rows for this filter set.</p>
			{:else}
				<table>
					<thead>
						<tr>
							<th scope="col">Employee</th>
							<th scope="col">Sales volume</th>
							<th scope="col">Rental revenue</th>
							<th scope="col">Deals</th>
							<th scope="col">Occupancy</th>
						</tr>
					</thead>
					<tbody>
						{#each byEmployee as row (row.employeeId)}
							<tr>
								<td>
									<span class="admin-analytics__name">{row.name}</span>
									<span class="admin-analytics__role">{row.role}</span>
								</td>
								<td>{formatUsd(row.salesVolume)}</td>
								<td>{formatUsd(row.rentalRevenue)}</td>
								<td>{row.closedDeals}</td>
								<td>{formatPct(row.occupancyRate)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</section>
	{/if}
</section>

<style>
	.admin-analytics {
		display: grid;
		gap: var(--spacing-5);
		padding: 1rem 1.05rem;
		border: 1px solid var(--border);
	}

	.admin-analytics__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--spacing-4);
		align-items: flex-start;
	}

	.admin-analytics__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-analytics h2 {
		margin: 0.2rem 0 0;
		font-size: 1.2rem;
	}

	.admin-analytics h3 {
		margin: 0 0 0.65rem;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-analytics__lede {
		margin: 0.4rem 0 0;
		max-width: 42ch;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
		line-height: 1.45;
	}

	.admin-analytics__lede code {
		font-size: 0.85em;
	}

	.admin-analytics__source {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.admin-analytics__source span {
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--border);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.admin-analytics__source span[data-source="external"] {
		border-color: var(--foreground);
	}

	.admin-analytics__source button {
		padding: 0.4rem 0.7rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}

	.admin-analytics__source button:hover:not(:disabled) {
		border-color: var(--foreground);
	}

	.admin-analytics__source button:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.admin-analytics__filters {
		display: grid;
		gap: 0.65rem;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.admin-analytics__filters :global(select) {
		width: 100%;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
	}

	.admin-analytics__kpis {
		display: grid;
		gap: 1px;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid var(--border);
		background: var(--border);
	}

	.admin-analytics__kpi {
		display: grid;
		gap: 0.25rem;
		padding: 0.85rem 0.8rem;
		background: var(--background);
	}

	.admin-analytics__kpi-label,
	.admin-analytics__kpi-meta {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-analytics__kpi strong {
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.admin-analytics__occupancy {
		height: 0.35rem;
		background: color-mix(in oklab, var(--muted) 55%, transparent);
	}

	.admin-analytics__occupancy-fill {
		height: 100%;
		background: var(--foreground);
	}

	.admin-analytics__trend {
		border: 1px solid var(--border);
		padding: 0.85rem 0.8rem;
	}

	.admin-analytics table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.admin-analytics th,
	.admin-analytics td {
		padding: 0.55rem 0.4rem;
		border-bottom: 1px solid var(--border);
		text-align: left;
		font-variant-numeric: tabular-nums;
	}

	.admin-analytics th {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
		font-weight: 700;
	}

	.admin-analytics__name {
		display: block;
		font-weight: 700;
	}

	.admin-analytics__role {
		display: block;
		font-size: var(--text-xs);
		color: var(--muted-foreground);
	}

	.admin-analytics__empty,
	.admin-analytics__error {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
	}

	.admin-analytics__error {
		color: var(--destructive);
	}

	@media (max-width: 48rem) {
		.admin-analytics__filters,
		.admin-analytics__kpis {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 30rem) {
		.admin-analytics__filters,
		.admin-analytics__kpis {
			grid-template-columns: 1fr;
		}
	}
</style>
