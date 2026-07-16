<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		description?: string;
		error?: string;
		class?: string;
		children?: Snippet;
	}

	const {
		description,
		error,
		class: className,
		children,
	}: Props = $props();
</script>

<div
	class={cn("ui-field", className)}
	data-invalid={error ? "true" : undefined}
>
	{@render children?.()}
	{#if description && !error}
		<p class="ui-field__description">{description}</p>
	{/if}
	{#if error}
		<p class="ui-field__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.ui-field {
		display: grid;
		gap: 0.45rem;
	}

	.ui-field__description,
	.ui-field__error {
		margin: 0;
		font-size: 0.875rem;
	}

	.ui-field__description {
		color: var(--muted-foreground, var(--color-text-secondary));
	}

	.ui-field__error {
		color: var(--destructive, #dc2626);
	}
</style>
