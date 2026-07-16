<script lang="ts">
	import { cn } from "../../../../lib/cn";

	export interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		class?: string;
		/** When true, prepend a Home crumb pointing at `/`. */
		includeHome?: boolean;
	}

	const {
		items,
		class: className,
		includeHome = true,
	}: Props = $props();

	const crumbs = $derived(
		includeHome ? [{ label: "Home", href: "/" }, ...items] : items,
	);
</script>

<nav aria-label="Breadcrumb" class={cn("ui-breadcrumb", className)}>
	<ol class="ui-breadcrumb__list">
		{#each crumbs as crumb, index (crumb.label + index)}
			<li class="ui-breadcrumb__item">
				{#if index > 0}
					<span class="ui-breadcrumb__sep" aria-hidden="true">/</span>
				{/if}
				{#if index === crumbs.length - 1 || !crumb.href}
					<span aria-current={index === crumbs.length - 1 ? "page" : undefined}>
						{crumb.label}
					</span>
				{:else}
					<a href={crumb.href}>{crumb.label}</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.ui-breadcrumb {
		margin-bottom: 1rem;
	}

	.ui-breadcrumb__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
		color: var(--muted-foreground, var(--color-text-secondary));
		font-size: 0.875rem;
	}

	.ui-breadcrumb__item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.ui-breadcrumb a {
		color: inherit;
		text-decoration: none;
	}

	.ui-breadcrumb a:hover {
		color: var(--foreground, var(--color-text-primary));
	}

	.ui-breadcrumb__sep {
		opacity: 0.55;
	}

	.ui-breadcrumb [aria-current="page"] {
		color: var(--foreground, var(--color-text-primary));
		font-weight: 600;
	}
</style>
