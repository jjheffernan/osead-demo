<script lang="ts">
	import Card from "../ui/data-display/Card/Card.svelte";
	import TagList from "./TagList.svelte";
	import BlogImageSVG from "./BlogImageSVG.svelte";
	import type { BlogPostSummary } from "../../lib/blog";
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";

	interface Props {
		post: BlogPostSummary;
		variant?: "grid" | "list";
		locale?: Locale;
		/** Heading level for the card title; use "h2" when cards sit directly under the page h1. */
		headingLevel?: "h2" | "h3";
	}

	const { post, variant = "grid", locale = "en", headingLevel = "h3" }: Props = $props();

	const dateLabel = $derived(
		new Date(post.dateISO).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}),
	);
	const excerpt = $derived(
		post.description.length > 180
			? `${post.description.slice(0, 177)}...`
			: post.description,
	);
</script>

<Card hover={true} class={`blog-card blog-card--${variant}`}>
	{#snippet header()}
		<a class="blog-card__media" href={post.href} aria-hidden="true" tabindex="-1">
			<BlogImageSVG slug={post.svgSlug} title={post.title} />
		</a>
	{/snippet}
	<div class="blog-card__body">
		{#if variant === "list"}<span class="blog-card__kicker">Featured</span>{/if}
		<p class="blog-card__meta">
			<time datetime={post.dateISO}>{dateLabel}</time>
			<span class="blog-card__dot" aria-hidden="true">&middot;</span>
			<span>{t(locale, "blog.minutesRead").replace("{n}", String(post.readingTime))}</span>
		</p>
		<svelte:element this={headingLevel} class="blog-card__title">
			<a href={post.href}>{post.title}</a>
		</svelte:element>
		<p class="blog-card__excerpt">{excerpt}</p>
		<TagList tags={post.tags} {locale} />
	</div>
</Card>

<style>
	:global(.blog-card) {
		height: 100%;
	}

	.blog-card__media {
		display: block;
		aspect-ratio: 1200 / 630;
		overflow: hidden;
		background: var(--color-bg-secondary);
	}

	.blog-card__media :global(svg) {
		border-bottom: 1px solid var(--color-border);
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.blog-card:hover) .blog-card__media :global(svg) {
		transform: scale(1.03);
	}

	.blog-card__body {
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.blog-card__kicker {
		justify-self: start;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.blog-card__meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.8125rem;
	}

	.blog-card__dot {
		opacity: 0.5;
	}

	.blog-card__title {
		margin: 0;
		font-size: 1.2rem;
		line-height: 1.3;
		letter-spacing: -0.01em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.blog-card__title a {
		color: inherit;
		text-decoration: none;
	}

	.blog-card__title a:hover {
		color: var(--color-brand-primary);
	}

	.blog-card__excerpt {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: 1.65;
		font-size: 0.9375rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* === Featured / list variant: horizontal editorial layout === */
	:global(.blog-card--list) {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		align-items: stretch;
	}

	:global(.blog-card--list) .blog-card__media {
		aspect-ratio: auto;
		height: 100%;
		min-height: 17rem;
	}

	:global(.blog-card--list) .blog-card__media :global(svg) {
		height: 100%;
		border-bottom: none;
		border-right: 1px solid var(--color-border);
	}

	:global(.blog-card--list .ui-card__body) {
		align-content: center;
		gap: var(--space-md);
		padding: var(--space-2xl);
	}

	:global(.blog-card--list) .blog-card__title {
		font-size: clamp(1.5rem, 2.4vw, 2rem);
		-webkit-line-clamp: 3;
	}

	:global(.blog-card--list) .blog-card__excerpt {
		font-size: 1rem;
		-webkit-line-clamp: 3;
	}

	@media (max-width: 48rem) {
		:global(.blog-card--list) {
			grid-template-columns: 1fr;
		}

		:global(.blog-card--list) .blog-card__media {
			aspect-ratio: 1200 / 630;
			min-height: 0;
		}

		:global(.blog-card--list) .blog-card__media :global(svg) {
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}

		:global(.blog-card--list .ui-card__body) {
			padding: var(--space-lg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.blog-card__media :global(svg),
		:global(.blog-card:hover) .blog-card__media :global(svg) {
			transition: none;
			transform: none;
		}
	}
</style>
