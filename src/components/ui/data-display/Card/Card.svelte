<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		class?: string;
		hover?: boolean;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	const { class: className, hover = false, header, children, footer }: Props = $props();
</script>

<article class={cn("ui-card", hover && "ui-card--hover", className)}>
	{@render header?.()}
	<div class="ui-card__body">
		{@render children?.()}
	</div>
	{@render footer?.()}
</article>

<style>
	.ui-card {
		border: 1px solid var(--color-border);
		border-radius: 0.9rem;
		background: var(--color-bg-primary);
		overflow: hidden;
	}
	.ui-card--hover {
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	.ui-card--hover:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	.ui-card__body {
		padding: var(--space-lg);
	}
</style>
