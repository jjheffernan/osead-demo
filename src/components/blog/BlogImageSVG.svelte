<script lang="ts">
	interface Props {
		slug: string;
		title: string;
	}

	const { slug, title }: Props = $props();

	function hashString(input: string) {
		let hash = 0;
		for (let index = 0; index < input.length; index += 1) {
			hash = (hash << 5) - hash + input.charCodeAt(index);
			hash |= 0;
		}
		return Math.abs(hash);
	}

	// Deterministic, monochrome cover. We only vary geometry (never hue) so every
	// cover stays on-system with the neutral OKLCH palette and reads as a set.
	const hash = $derived(hashString(slug || title));
	const uid = $derived(`cv${hash.toString(36)}`);
	const anchorRight = $derived(hash % 2 === 0);
	const cx = $derived(anchorRight ? 940 : 260);
	const cy = $derived(250 + ((hash >> 2) % 140));
	const ringCount = $derived(3 + ((hash >> 3) % 2));
	const baseRadius = $derived(120 + ((hash >> 4) % 90));
	const rings = $derived(Array.from({ length: ringCount }, (_, i) => baseRadius + i * 78));
	const tick = $derived(30 + ((hash >> 5) % 60));
</script>

<svg
	viewBox="0 0 1200 630"
	role="img"
	aria-label={title}
	class="blog-cover"
	preserveAspectRatio="xMidYMid slice"
>
	<defs>
		<pattern id={`${uid}-dots`} width="34" height="34" patternUnits="userSpaceOnUse">
			<circle cx="2" cy="2" r="1.6" class="blog-cover__dot"></circle>
		</pattern>
		<radialGradient id={`${uid}-glow`} cx={anchorRight ? "78%" : "22%"} cy="38%" r="62%">
			<stop offset="0%" class="blog-cover__glow-in"></stop>
			<stop offset="100%" class="blog-cover__glow-out"></stop>
		</radialGradient>
	</defs>

	<rect width="1200" height="630" class="blog-cover__bg"></rect>
	<rect width="1200" height="630" fill={`url(#${uid}-dots)`}></rect>
	<rect width="1200" height="630" fill={`url(#${uid}-glow)`}></rect>

	<g class="blog-cover__rings">
		{#each rings as r (r)}
			<circle {cx} {cy} r={r} />
		{/each}
	</g>

	<line x1="72" y1={tick + 510} x2="172" y2={tick + 510} class="blog-cover__rule"></line>
</svg>

<style>
	.blog-cover {
		display: block;
		width: 100%;
		height: 100%;
		/* Drives currentColor-based strokes/fills below. */
		color: var(--color-text-primary);
	}

	.blog-cover__bg {
		fill: var(--color-bg-secondary);
	}

	.blog-cover__dot {
		fill: currentColor;
		opacity: 0.07;
	}

	.blog-cover__glow-in {
		stop-color: currentColor;
		stop-opacity: 0.08;
	}

	.blog-cover__glow-out {
		stop-color: currentColor;
		stop-opacity: 0;
	}

	.blog-cover__rings circle {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		opacity: 0.12;
	}

	.blog-cover__rule {
		stroke: currentColor;
		stroke-width: 3;
		opacity: 0.35;
	}
</style>
