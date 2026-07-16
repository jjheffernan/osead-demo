<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		/** Controlled open state — syncs to native <dialog>.showModal(). */
		open?: boolean;
		class?: string;
		labelledBy?: string;
		label?: string;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
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
	class={cn("ui-dialog", className)}
	aria-labelledby={labelledBy}
	aria-label={label}
	onclose={onDialogClose}
	onclick={onBackdropClick}
>
	{@render children?.()}
</dialog>

<style>
	.ui-dialog::backdrop {
		background: color-mix(in srgb, var(--foreground, #0a0a0a) 45%, transparent);
		backdrop-filter: blur(0.35rem);
	}

	.ui-dialog {
		position: fixed;
		inset-block-start: 9vh;
		inset-inline: 0;
		margin-inline: auto;
		margin-block: 0;
		border: 1px solid var(--border, var(--color-border));
		border-radius: var(--radius-2xl, 1rem);
		padding: 0;
		width: min(40rem, calc(100vw - 2rem));
		max-width: none;
		max-height: min(80vh, 42rem);
		overflow: hidden;
		background: var(--background, var(--color-bg-primary));
		color: var(--foreground, var(--color-text-primary));
		box-shadow: var(--shadow-lg);
	}

	.ui-dialog[open] {
		animation: ui-dialog-in 0.18s ease;
	}

	.ui-dialog[open]::backdrop {
		animation: ui-dialog-fade 0.18s ease;
	}

	@keyframes ui-dialog-in {
		from {
			opacity: 0;
			transform: translateY(-0.75rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes ui-dialog-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ui-dialog[open],
		.ui-dialog[open]::backdrop {
			animation: none;
		}
	}
</style>
