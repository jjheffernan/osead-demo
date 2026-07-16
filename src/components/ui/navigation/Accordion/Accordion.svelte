<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	export interface AccordionItem {
		value: string;
		title: string;
		content: string | Snippet;
	}

	interface Props {
		items: AccordionItem[];
		type?: "single" | "multiple";
		class?: string;
	}

	const { items, type = "single", class: className }: Props = $props();

	let openValues = $state<string[]>([]);

	function isOpen(value: string) {
		return openValues.includes(value);
	}

	function onToggle(value: string, open: boolean) {
		if (type === "single") {
			openValues = open ? [value] : [];
			return;
		}
		openValues = open
			? [...openValues, value]
			: openValues.filter((v) => v !== value);
	}
</script>

<div class={cn("ui-accordion", className)}>
	{#each items as item (item.value)}
		<details
			class="ui-accordion__item"
			open={isOpen(item.value)}
			ontoggle={(event) => {
				onToggle(item.value, (event.currentTarget as HTMLDetailsElement).open);
			}}
		>
			<summary class="ui-accordion__trigger">
				<span>{item.title}</span>
				<svg
					class="ui-accordion__chevron"
					width="16"
					height="16"
					viewBox="0 0 20 20"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M7 7L10 10L13 7"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</summary>
			<div class="ui-accordion__content">
				{#if typeof item.content === "string"}
					<p>{item.content}</p>
				{:else}
					{@render item.content()}
				{/if}
			</div>
		</details>
	{/each}
</div>

<style>
	.ui-accordion {
		display: grid;
	}

	.ui-accordion__item {
		border-bottom: 1px solid var(--border, var(--color-border));
	}

	.ui-accordion__trigger {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 0;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
		user-select: none;
	}

	.ui-accordion__trigger::-webkit-details-marker {
		display: none;
	}

	.ui-accordion__trigger:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.ui-accordion__chevron {
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.ui-accordion__item[open] .ui-accordion__chevron {
		transform: rotate(180deg);
	}

	.ui-accordion__content {
		padding: 0 0 0.85rem;
		color: var(--muted-foreground, var(--color-text-secondary));
		line-height: 1.6;
	}

	.ui-accordion__content p {
		margin: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.ui-accordion__chevron {
			transition: none;
		}
	}
</style>
