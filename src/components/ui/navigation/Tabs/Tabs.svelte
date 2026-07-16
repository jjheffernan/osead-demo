<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	export interface TabItem {
		value: string;
		label: string;
		panel: Snippet;
	}

	interface Props {
		tabs: TabItem[];
		value?: string;
		class?: string;
		label?: string;
	}

	let {
		tabs,
		value = $bindable(tabs[0]?.value ?? ""),
		class: className,
		label = "Tabs",
	}: Props = $props();

	const active = $derived(tabs.find((tab) => tab.value === value) ?? tabs[0]);
</script>

<div class={cn("ui-tabs", className)}>
	<div class="ui-tabs__list" role="tablist" aria-label={label}>
		{#each tabs as tab (tab.value)}
			<button
				type="button"
				class="ui-tabs__trigger"
				role="tab"
				id={`tab-${tab.value}`}
				aria-selected={value === tab.value}
				aria-controls={`panel-${tab.value}`}
				tabindex={value === tab.value ? 0 : -1}
				onclick={() => (value = tab.value)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	{#if active}
		<div
			class="ui-tabs__panel"
			role="tabpanel"
			id={`panel-${active.value}`}
			aria-labelledby={`tab-${active.value}`}
		>
			{@render active.panel()}
		</div>
	{/if}
</div>

<style>
	.ui-tabs {
		display: grid;
		gap: 1rem;
	}

	.ui-tabs__list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		border-bottom: 1px solid var(--border, var(--color-border));
	}

	.ui-tabs__trigger {
		margin: 0 0 -1px;
		padding: 0.55rem 0.85rem;
		border: 1px solid transparent;
		border-bottom: none;
		border-radius: var(--radius-md, 0.5rem) var(--radius-md, 0.5rem) 0 0;
		background: transparent;
		color: var(--muted-foreground, var(--color-text-secondary));
		font: inherit;
		font-weight: 700;
		font-size: var(--text-sm, 0.875rem);
		cursor: pointer;
	}

	.ui-tabs__trigger[aria-selected="true"] {
		border-color: var(--border, var(--color-border));
		background: var(--background, var(--color-bg-primary));
		color: var(--foreground, var(--color-text-primary));
	}

	.ui-tabs__trigger:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.ui-tabs__panel {
		min-width: 0;
	}
</style>
