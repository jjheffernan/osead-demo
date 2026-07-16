<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		id: string;
		align?: "start" | "end";
		class?: string;
		trigger: Snippet;
		children?: Snippet;
	}

	const { id, align = "start", class: className, trigger, children }: Props =
		$props();
</script>

<div class={cn("ui-popover", className)} data-align={align}>
	<button
		type="button"
		class="ui-popover__trigger"
		popovertarget={id}
		aria-haspopup="dialog"
	>
		{@render trigger()}
	</button>
	<div {id} class="ui-popover__panel" popover="auto">
		{@render children?.()}
	</div>
</div>

<style>
	.ui-popover {
		position: relative;
		display: inline-flex;
	}

	.ui-popover__trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.ui-popover__trigger:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.ui-popover__panel {
		margin: 0;
		padding: 0.55rem;
		border: 1px solid var(--border, var(--color-border));
		border-radius: var(--radius-lg, 0.75rem);
		background: var(--background, var(--color-bg-primary));
		color: var(--foreground, var(--color-text-primary));
		box-shadow: var(--shadow-md);
		min-width: 11rem;
	}

	.ui-popover__panel:popover-open {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
