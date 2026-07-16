<script lang="ts">
	import type { TestimonialView } from "../../lib/testimonials";

	interface Props {
		items: Pick<TestimonialView, "quote" | "author" | "rating">[];
		title?: string;
		label?: string;
	}

	let {
		items,
		title = "What clients say",
		label = "Client ratings",
	}: Props = $props();

	let index = $state(0);

	const count = $derived(items.length);
	const current = $derived(items[index] ?? null);

	function stars(n: number): string {
		return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
	}

	function prev() {
		if (count === 0) return;
		index = (index - 1 + count) % count;
	}

	function next() {
		if (count === 0) return;
		index = (index + 1) % count;
	}

	function go(i: number) {
		index = i;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			prev();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			next();
		}
	}
</script>

{#if count > 0 && current}
	<section
		class="ratings-carousel"
		aria-roledescription="carousel"
		aria-label={label}
		tabindex="0"
		onkeydown={onKeydown}
	>
		<header class="ratings-carousel__head">
			<p class="ratings-carousel__eyebrow">Ratings</p>
			<h2 class="ratings-carousel__title">{title}</h2>
			<p class="ratings-carousel__count" aria-live="polite">
				{index + 1} / {count}
			</p>
		</header>

		<div class="ratings-carousel__stage">
			<blockquote class="ratings-carousel__quote" aria-live="polite">
				<p class="ratings-carousel__stars" aria-hidden="true">{stars(current.rating)}</p>
				<p class="ratings-carousel__text">“{current.quote}”</p>
				<footer>— {current.author}</footer>
			</blockquote>

			{#if count > 1}
				<div class="ratings-carousel__controls">
					<button type="button" class="ratings-carousel__btn" onclick={prev} aria-label="Previous rating">
						←
					</button>
					<div class="ratings-carousel__dots" role="tablist" aria-label="Choose rating">
						{#each items as item, i (item.author + item.quote)}
							<button
								type="button"
								class="ratings-carousel__dot"
								class:ratings-carousel__dot--active={i === index}
								role="tab"
								aria-selected={i === index}
								aria-label={`Show rating ${i + 1}`}
								onclick={() => go(i)}
							></button>
						{/each}
					</div>
					<button type="button" class="ratings-carousel__btn" onclick={next} aria-label="Next rating">
						→
					</button>
				</div>
			{/if}
		</div>
	</section>
{/if}

<style>
	.ratings-carousel {
		display: grid;
		gap: 0.75rem;
		padding-block: 1.15rem;
		padding-inline: clamp(1rem, 3vw, 1.5rem);
		background: var(--primary);
		color: var(--primary-foreground);
		outline: none;
	}

	.ratings-carousel:focus-visible {
		outline: 2px solid var(--primary-foreground);
		outline-offset: -4px;
	}

	.ratings-carousel__head {
		display: grid;
		gap: 0.25rem;
		max-width: 72rem;
		margin-inline: auto;
		width: 100%;
	}

	.ratings-carousel__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		opacity: 0.75;
	}

	.ratings-carousel__title {
		margin: 0;
		font-size: clamp(1.25rem, 2.5vw, 1.65rem);
	}

	.ratings-carousel__count {
		margin: 0;
		font-size: var(--text-sm);
		opacity: 0.75;
		font-variant-numeric: tabular-nums;
	}

	.ratings-carousel__stage {
		display: grid;
		gap: 1.15rem;
		max-width: 40rem;
		margin-inline: auto;
		width: 100%;
	}

	.ratings-carousel__quote {
		margin: 0;
		display: grid;
		gap: 0.65rem;
	}

	.ratings-carousel__stars {
		margin: 0;
		letter-spacing: 0.08em;
		opacity: 0.9;
	}

	.ratings-carousel__text {
		margin: 0;
		font-size: clamp(1.05rem, 2.2vw, 1.35rem);
		line-height: 1.45;
	}

	.ratings-carousel__quote footer {
		font-size: var(--text-sm);
		opacity: 0.85;
	}

	.ratings-carousel__controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.ratings-carousel__btn {
		appearance: none;
		border: 1px solid color-mix(in oklab, var(--primary-foreground) 35%, transparent);
		background: transparent;
		color: inherit;
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.1rem;
		cursor: pointer;
	}

	.ratings-carousel__btn:hover {
		background: color-mix(in oklab, var(--primary-foreground) 12%, transparent);
	}

	.ratings-carousel__dots {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
	}

	.ratings-carousel__dot {
		appearance: none;
		width: 0.55rem;
		height: 0.55rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: color-mix(in oklab, var(--primary-foreground) 35%, transparent);
		cursor: pointer;
	}

	.ratings-carousel__dot--active {
		background: var(--primary-foreground);
		transform: scale(1.15);
	}

	@media (prefers-reduced-motion: reduce) {
		.ratings-carousel__dot--active {
			transform: none;
		}
	}
</style>
