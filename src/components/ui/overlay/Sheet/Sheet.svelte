<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	type Side = "left" | "right" | "top" | "bottom";

	interface Props {
		open?: boolean;
		side?: Side;
		class?: string;
		labelledBy?: string;
		label?: string;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		side = "right",
		class: className,
		labelledBy,
		label,
		children,
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl || typeof dialogEl.showModal !== "function") return;
		if (open && !dialogEl.open) dialogEl.showModal();
		else if (!open && dialogEl.open) dialogEl.close();
	});

	function onDialogClose() {
		open = false;
	}

	function onBackdropClick(event: MouseEvent) {
		if (event.target === dialogEl) dialogEl?.close();
	}
</script>

<dialog
	bind:this={dialogEl}
	class={cn("ui-sheet", `ui-sheet--${side}`, className)}
	aria-labelledby={labelledBy}
	aria-label={label}
	onclose={onDialogClose}
	onclick={onBackdropClick}
>
	<div class="ui-sheet__panel">
		{@render children?.()}
	</div>
</dialog>

<style>
	.ui-sheet::backdrop {
		background: color-mix(in srgb, var(--foreground, #0a0a0a) 40%, transparent);
	}

	.ui-sheet {
		position: fixed;
		margin: 0;
		padding: 0;
		border: none;
		max-width: none;
		max-height: none;
		background: transparent;
		color: var(--foreground, var(--color-text-primary));
	}

	.ui-sheet__panel {
		height: 100%;
		background: var(--background, var(--color-bg-primary));
		border: 1px solid var(--border, var(--color-border));
		overflow: auto;
	}

	.ui-sheet--right,
	.ui-sheet--left {
		inset-block: 0;
		width: min(20rem, calc(100vw - 2.5rem));
		height: 100%;
	}

	.ui-sheet--right {
		inset-inline: auto 0;
	}

	.ui-sheet--left {
		inset-inline: 0 auto;
	}

	.ui-sheet--top,
	.ui-sheet--bottom {
		inset-inline: 0;
		width: 100%;
		height: min(70vh, 28rem);
	}

	.ui-sheet--top {
		inset-block: 0 auto;
	}

	.ui-sheet--bottom {
		inset-block: auto 0;
	}

	.ui-sheet--right[open] .ui-sheet__panel {
		animation: ui-sheet-right 0.2s ease;
	}

	.ui-sheet--left[open] .ui-sheet__panel {
		animation: ui-sheet-left 0.2s ease;
	}

	@keyframes ui-sheet-right {
		from {
			transform: translateX(100%);
		}
		to {
			transform: none;
		}
	}

	@keyframes ui-sheet-left {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ui-sheet--right[open] .ui-sheet__panel,
		.ui-sheet--left[open] .ui-sheet__panel {
			animation: none;
		}
	}
</style>
