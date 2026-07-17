<script lang="ts">
	import { formatUsd } from "../../lib/admin-analytics";

	interface Point {
		period: string;
		value: number;
	}

	interface Props {
		points: Point[];
		label?: string;
	}

	let { points, label = "Sales volume trend" }: Props = $props();

	const viewWidth = 240;
	const viewHeight = 48;
	const pad = 3;

	const values = $derived(points.map((p) => p.value));
	const maxValue = $derived(values.length ? Math.max(...values) : 0);
	const minValue = $derived(values.length ? Math.min(...values) : 0);
	const valueRange = $derived(maxValue - minValue || 1);

	const polylinePoints = $derived(
		points
			.map((point, i) => {
				const x =
					points.length > 1
						? pad + (i / (points.length - 1)) * (viewWidth - pad * 2)
						: viewWidth / 2;
				const y =
					viewHeight -
					pad -
					((point.value - minValue) / valueRange) * (viewHeight - pad * 2);
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(" "),
	);

	function formatMonth(period: string): string {
		const date = new Date(`${period}T00:00:00`);
		return Number.isNaN(date.getTime())
			? period
			: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
	}

	const summary = $derived(
		points.length
			? `${label}, ${formatMonth(points[0].period)} to ${formatMonth(points[points.length - 1].period)}: ${formatUsd(minValue)} to ${formatUsd(maxValue)}`
			: `${label}: no data for this filter set`,
	);
</script>

<div class="sales-sparkline">
	{#if points.length === 0}
		<p class="sales-sparkline__empty">No trend data for this filter set.</p>
	{:else}
		<svg
			class="sales-sparkline__svg"
			viewBox={`0 0 ${viewWidth} ${viewHeight}`}
			role="img"
			aria-label={summary}
		>
			<polyline
				points={polylinePoints}
				fill="none"
				stroke="var(--foreground)"
				stroke-width="2"
				stroke-linejoin="round"
				stroke-linecap="round"
			/>
		</svg>
		<span class="sales-sparkline__offscreen">
			{#each points as point (point.period)}
				{formatMonth(point.period)}: {formatUsd(point.value)}.
			{/each}
		</span>
	{/if}
</div>

<style>
	.sales-sparkline {
		display: block;
	}

	.sales-sparkline__svg {
		display: block;
		width: 100%;
		height: 3rem;
	}

	.sales-sparkline__empty {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.sales-sparkline__offscreen {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
