<script lang="ts">
	import Badge from "../ui/data-display/Badge/Badge.svelte";
	import type { Locale } from "../../lib/site-config";

	interface Props {
		tags: string[];
		basePath?: string;
		/** Reserved for locale-prefixed tag links when i18n routes expand. */
		locale?: Locale;
	}

	const { tags, basePath = "/blog" }: Props = $props();

	function slugify(value: string) {
		return value
			.trim()
			.toLowerCase()
			.replace(/['"]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
</script>

{#if tags.length > 0}
	<div class="blog-tags" aria-label="Post tags">
		{#each tags as tag (tag)}
			<a href={`${basePath}?tag=${slugify(tag)}`}>
				<Badge variant="outline">{tag}</Badge>
			</a>
		{/each}
	</div>
{/if}

<style>
	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.blog-tags a {
		text-decoration: none;
	}
</style>
