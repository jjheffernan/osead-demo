<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		for?: string;
		required?: boolean;
		class?: string;
		children?: Snippet;
	}

	const {
		for: htmlFor,
		required = false,
		class: className,
		children,
	}: Props = $props();
</script>

<label class={cn("ui-label", className)} for={htmlFor}>
	{@render children?.()}
	{#if required}<span class="ui-label__req" aria-hidden="true"> *</span>{/if}
</label>

<style>
	.ui-label {
		display: inline-flex;
		align-items: baseline;
		gap: 0.15rem;
		font-weight: 600;
		font-size: var(--text-sm, 0.875rem);
		color: var(--foreground, var(--color-text-primary));
	}

	.ui-label__req {
		color: var(--muted-foreground, var(--color-text-secondary));
	}
</style>
