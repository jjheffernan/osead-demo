<script lang="ts">
	import TagList from "./TagList.svelte";
	import BlogImageSVG from "./BlogImageSVG.svelte";
	import type { BlogPostSummary } from "../../lib/blog";
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";

	interface Props {
		post: BlogPostSummary;
		locale?: Locale;
	}

	const { post, locale = "en" }: Props = $props();

	const dateLabel = $derived(
		new Date(post.dateISO).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
	);
</script>

<header class="article-hero">
	<div class="article-hero__content">
		<h1>{post.title}</h1>
		<p class="article-hero__description">{post.description}</p>

		<div class="article-hero__meta">
			<span class="article-hero__author">{post.author}</span>
			<span class="article-hero__dot" aria-hidden="true">&middot;</span>
			<time datetime={post.dateISO}>{dateLabel}</time>
			<span class="article-hero__dot" aria-hidden="true">&middot;</span>
			<span>
				{t(locale, "blog.minutesRead").replace("{n}", String(post.readingTime))}
			</span>
		</div>

		<TagList tags={post.tags} {locale} />
	</div>

	<figure class="article-hero__media">
		<BlogImageSVG slug={post.svgSlug} title={post.title} />
	</figure>
</header>

<style>
	.article-hero {
		display: grid;
		gap: var(--space-2xl);
		margin-bottom: var(--space-2xl);
	}

	.article-hero__content {
		display: grid;
		gap: var(--space-md);
		max-width: 52rem;
	}

	.article-hero h1 {
		margin: 0;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		line-height: 1.05;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.article-hero__description {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: clamp(1.0625rem, 2vw, 1.25rem);
		line-height: 1.6;
		max-width: 42rem;
		text-wrap: pretty;
	}

	.article-hero__meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-xs);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
	}

	.article-hero__author {
		color: var(--color-text-primary);
		font-weight: 600;
	}

	.article-hero__dot {
		opacity: 0.5;
	}

	.article-hero__media {
		margin: 0;
		aspect-ratio: 1200 / 540;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-2xl);
	}

	.article-hero__media :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
