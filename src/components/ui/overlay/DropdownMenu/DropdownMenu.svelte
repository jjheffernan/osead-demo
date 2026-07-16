<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../../lib/cn";

	interface Props {
		class?: string;
		align?: "start" | "end";
		trigger: Snippet;
		children?: Snippet;
	}

	const { class: className, align = "start", trigger, children }: Props =
		$props();

	let open = $state(false);
	let rootEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			if (rootEl && !rootEl.contains(event.target as Node)) open = false;
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") open = false;
		};
		document.addEventListener("pointerdown", onPointer);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	});
</script>

<div
	bind:this={rootEl}
	class={cn("ui-dropdown", className)}
	data-align={align}
>
	<button
		type="button"
		class="ui-dropdown__trigger"
		aria-expanded={open}
		aria-haspopup="menu"
		onclick={() => (open = !open)}
	>
		{@render trigger()}
	</button>
	{#if open}
		<div class="ui-dropdown__panel" role="menu">
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	.ui-dropdown {
		position: relative;
		display: inline-flex;
	}

	.ui-dropdown__trigger {
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

	.ui-dropdown__trigger:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.ui-dropdown__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		z-index: 40;
		min-width: 11rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.45rem;
		border: 1px solid var(--border, var(--color-border));
		border-radius: var(--radius-lg, 0.75rem);
		background: var(--background, var(--color-bg-primary));
		box-shadow: var(--shadow-md);
	}

	.ui-dropdown[data-align="start"] .ui-dropdown__panel {
		left: 0;
	}

	.ui-dropdown[data-align="end"] .ui-dropdown__panel {
		right: 0;
	}

	.ui-dropdown__panel :global(a),
	.ui-dropdown__panel :global(button.ui-dropdown__item) {
		display: block;
		width: 100%;
		padding: 0.45rem 0.55rem;
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		background: transparent;
		color: var(--muted-foreground, var(--color-text-secondary));
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 600;
		text-align: start;
		text-decoration: none;
		cursor: pointer;
	}

	.ui-dropdown__panel :global(a:hover),
	.ui-dropdown__panel :global(button.ui-dropdown__item:hover) {
		color: var(--foreground, var(--color-text-primary));
		background: var(--muted, var(--color-bg-tertiary));
	}
</style>
