<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		content: string;
		side?: "top" | "bottom";
		class?: string;
		children?: Snippet;
	}

	const { content, side = "bottom", class: className, children }: Props =
		$props();
</script>

<span class={cn("ui-tooltip", className)} data-side={side}>
	{@render children?.()}
	<span class="ui-tooltip__content" role="tooltip">{content}</span>
</span>

<style>
	.ui-tooltip {
		position: relative;
		display: inline-flex;
	}

	.ui-tooltip__content {
		position: absolute;
		z-index: 50;
		left: 50%;
		width: max-content;
		max-width: 14rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--border, var(--color-border));
		border-radius: var(--radius-sm, 0.35rem);
		background: var(--foreground, var(--color-text-primary));
		color: var(--background, var(--color-bg-primary));
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		opacity: 0;
		pointer-events: none;
		transform: translateX(-50%);
		transition: opacity 0.12s ease;
	}

	.ui-tooltip[data-side="bottom"] .ui-tooltip__content {
		top: calc(100% + 0.4rem);
	}

	.ui-tooltip[data-side="top"] .ui-tooltip__content {
		bottom: calc(100% + 0.4rem);
	}

	.ui-tooltip:hover .ui-tooltip__content,
	.ui-tooltip:focus-within .ui-tooltip__content {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.ui-tooltip__content {
			transition: none;
		}
	}
</style>
