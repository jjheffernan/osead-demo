<script lang="ts">
	/**
	 * Full-bleed CSS marquee. Decorative motion pauses on hover/focus and
	 * when prefers-reduced-motion is set.
	 */
	interface Props {
		items: string[];
		/** Accessible name for the region */
		label: string;
		/** Seconds for one loop */
		duration?: number;
		/** Visual weight */
		tone?: "muted" | "invert";
		/** Uppercase labels (markets) vs natural quotes */
		casing?: "upper" | "natural";
	}

	let {
		items,
		label,
		duration = 36,
		tone = "muted",
		casing = "upper",
	}: Props = $props();

	const loop = $derived([...items, ...items]);
</script>

<section
	class="marquee"
	class:marquee--invert={tone === "invert"}
	class:marquee--natural={casing === "natural"}
	aria-label={label}
>
	<ul class="marquee__sr">
		{#each items as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
	<div class="marquee__viewport" aria-hidden="true">
		<ul class="marquee__track" style={`--marquee-duration: ${duration}s`}>
			{#each loop as item, i (item + String(i))}
				<li class="marquee__item">
					<span class="marquee__text">{item}</span>
					<span class="marquee__sep" aria-hidden="true">✦</span>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.marquee {
		overflow: hidden;
		border-block: 1px solid var(--border);
		background: color-mix(in oklab, var(--muted) 55%, transparent);
		color: var(--foreground);
	}

	.marquee--invert {
		background: var(--primary);
		color: var(--primary-foreground);
		border-color: transparent;
	}

	.marquee__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.marquee__viewport {
		overflow: hidden;
		padding-block: 0.85rem;
	}

	.marquee__track {
		display: flex;
		width: max-content;
		margin: 0;
		padding: 0;
		list-style: none;
		gap: 0;
		animation: marquee-scroll var(--marquee-duration, 36s) linear infinite;
	}

	.marquee:hover .marquee__track,
	.marquee:focus-within .marquee__track {
		animation-play-state: paused;
	}

	.marquee__item {
		display: inline-flex;
		align-items: center;
		gap: 1.25rem;
		padding-inline: 0 1.25rem;
		white-space: nowrap;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.marquee--natural .marquee__item {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium, 500);
		letter-spacing: normal;
		text-transform: none;
	}

	.marquee__sep {
		opacity: 0.45;
		font-size: 0.65rem;
	}

	@keyframes marquee-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee__track {
			animation: none;
			flex-wrap: wrap;
			justify-content: center;
			width: 100%;
			max-width: var(--container-max, 72rem);
			margin-inline: auto;
			padding-inline: 1rem;
			gap: 0.75rem 1.5rem;
		}

		.marquee__item:nth-child(n + 9) {
			display: none;
		}

		.marquee__sep {
			display: none;
		}
	}
</style>
