<script lang="ts">
	import { averageRating } from "../../lib/testimonials";

	export type TestimonialItem = {
		quote: string;
		author: string;
		rating: number;
	};

	interface Props {
		items: TestimonialItem[];
		title?: string;
		/** Compact trust line (home / aside); default is a full list. */
		compact?: boolean;
	}

	let { items, title = "Guest feedback", compact = false }: Props = $props();

	const avg = $derived(averageRating(items));

	function stars(n: number): string {
		return "★".repeat(n) + "☆".repeat(5 - n);
	}
</script>

{#if items.length > 0}
	<section class="testimonials" class:testimonials--compact={compact} aria-label={title}>
		<header class="testimonials__head">
			{#if !compact}
				<p class="testimonials__eyebrow">Ratings</p>
			{/if}
			<h2 class="testimonials__title">{title}</h2>
			{#if avg !== null}
				<p class="testimonials__avg" aria-label={`Average rating ${avg} out of 5`}>
					<span class="testimonials__stars" aria-hidden="true">{stars(Math.round(avg))}</span>
					<span>{avg} · {items.length} review{items.length === 1 ? "" : "s"}</span>
				</p>
			{/if}
		</header>

		{#if compact}
			{@const first = items[0]}
			{#if first}
				<blockquote class="testimonials__quote">
					<p>“{first.quote}”</p>
					<footer>
						<span class="testimonials__stars" aria-hidden="true">{stars(first.rating)}</span>
						— {first.author}
					</footer>
				</blockquote>
			{/if}
		{:else}
			<ul class="testimonials__list">
				{#each items as item (item.author + item.quote)}
					<li>
						<blockquote>
							<p class="testimonials__stars" aria-hidden="true">{stars(item.rating)}</p>
							<p>“{item.quote}”</p>
							<footer>— {item.author}</footer>
						</blockquote>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}

<style>
	.testimonials {
		display: grid;
		gap: var(--spacing-4, 1rem);
	}

	.testimonials--compact {
		gap: var(--spacing-2, 0.5rem);
		padding: var(--spacing-4, 1rem);
		border: 1px solid var(--border);
		background: var(--card);
	}

	.testimonials__eyebrow {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-xs, 0.75rem);
		font-weight: var(--font-weight-semibold, 600);
		letter-spacing: var(--tracking-widest, 0.08em);
		text-transform: uppercase;
	}

	.testimonials__title {
		margin: 0.25rem 0 0;
		font-size: var(--text-lg, 1.125rem);
	}

	.testimonials--compact .testimonials__title {
		font-size: var(--text-sm, 0.9rem);
	}

	.testimonials__avg {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0.35rem 0 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm, 0.9rem);
	}

	.testimonials__stars {
		color: var(--primary);
		letter-spacing: 0.05em;
	}

	.testimonials__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--spacing-4, 1rem);
	}

	.testimonials__list blockquote,
	.testimonials__quote {
		margin: 0;
	}

	.testimonials__list p,
	.testimonials__quote p {
		margin: 0.35rem 0 0;
		line-height: 1.5;
	}

	.testimonials__list footer,
	.testimonials__quote footer {
		margin-top: 0.5rem;
		color: var(--muted-foreground);
		font-size: var(--text-sm, 0.9rem);
	}
</style>
