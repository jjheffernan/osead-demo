<script lang="ts">
	import BlogCard from "./BlogCard.svelte";
	import type { BlogPostSummary } from "../../lib/blog";
	import type { Locale } from "../../lib/site-config";

	interface Props {
		posts: BlogPostSummary[];
		title: string;
		locale?: Locale;
	}

	const { posts, title, locale = "en" }: Props = $props();
</script>

{#if posts.length > 0}
	<section class="related-posts">
		<h2 class="related-posts__title">{title}</h2>
		<div class="related-posts__grid">
			{#each posts as post (post.id)}
				<BlogCard {post} variant="grid" {locale} />
			{/each}
		</div>
	</section>
{/if}

<style>
	.related-posts {
		margin-top: var(--space-3xl);
		padding-top: var(--space-xl);
		border-top: 1px solid var(--color-border);
	}

	.related-posts__title {
		margin: 0 0 var(--space-lg);
		font-size: clamp(1.5rem, 2.5vw, 1.875rem);
		letter-spacing: -0.01em;
	}

	.related-posts__grid {
		display: grid;
		gap: var(--space-lg);
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
	}
</style>
