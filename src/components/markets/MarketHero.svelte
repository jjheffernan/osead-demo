<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		image: string;
		alt?: string;
		eyebrow?: string;
		title: string;
		lead?: string;
		crumbs?: Snippet;
		children?: Snippet;
	}

	const { image, alt = "", eyebrow, title, lead, crumbs, children }: Props = $props();
</script>

<section class="market-hero">
	<img class="market-hero__media" src={image} {alt} />
	<div class="market-hero__veil" aria-hidden="true"></div>
	<div class="market-hero__content container">
		{@render crumbs?.()}
		{#if eyebrow}
			<p class="market-hero__eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="market-hero__title">{title}</h1>
		{#if lead}<p class="market-hero__lead">{lead}</p>{/if}
		{@render children?.()}
	</div>
</section>

<style>
	.market-hero {
		position: relative;
		isolation: isolate;
		display: grid;
		align-items: end;
		min-height: clamp(22rem, 58vh, 36rem);
		overflow: hidden;
		color: var(--surface-invert-foreground);
		background: var(--surface-invert);
	}

	.market-hero__media {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.market-hero__veil {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(
				to top,
				color-mix(in srgb, var(--surface-invert) 88%, transparent) 0%,
				color-mix(in srgb, var(--surface-invert) 45%, transparent) 45%,
				color-mix(in srgb, var(--surface-invert) 28%, transparent) 100%
			);
	}

	.market-hero__content {
		display: grid;
		gap: 0.85rem;
		padding-block: clamp(1.75rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem);
		max-width: 48rem;
	}

	.market-hero__content :global(.breadcrumbs),
	.market-hero__content :global(.breadcrumbs__list),
	.market-hero__content :global(.breadcrumbs a),
	.market-hero__content :global(.breadcrumbs span) {
		color: color-mix(
			in srgb,
			var(--surface-invert-foreground) 82%,
			transparent
		);
	}

	.market-hero__content :global(.breadcrumbs a:hover) {
		color: var(--surface-invert-foreground);
	}

	.market-hero__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: color-mix(
			in srgb,
			var(--surface-invert-foreground) 82%,
			transparent
		);
	}

	.market-hero__title {
		margin: 0;
		font-size: clamp(2.25rem, 5.5vw, 3.75rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
		text-wrap: balance;
		color: inherit;
	}

	.market-hero__lead {
		margin: 0;
		max-width: 40rem;
		font-size: clamp(1rem, 1.6vw, 1.2rem);
		line-height: 1.55;
		color: color-mix(
			in srgb,
			var(--surface-invert-foreground) 84%,
			transparent
		);
		text-wrap: pretty;
	}
</style>
