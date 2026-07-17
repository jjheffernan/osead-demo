<script lang="ts">
	import { onMount } from "svelte";
	import { isSaved, toggleSavedListing } from "../../lib/guest-store";

	interface Props {
		propertySlug: string;
	}

	const { propertySlug }: Props = $props();

	let saved = $state(false);

	onMount(() => {
		saved = isSaved(propertySlug);
	});

	function toggle() {
		saved = toggleSavedListing(propertySlug);
	}
</script>

<button
	type="button"
	class="save-home"
	class:save-home--saved={saved}
	aria-pressed={saved}
	onclick={toggle}
>
	{saved ? "Saved" : "Save home"}
</button>

<style>
	.save-home {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--card);
		color: var(--foreground);
		padding: var(--spacing-2) var(--spacing-4);
		font: inherit;
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.save-home--saved {
		border-color: var(--primary);
		background: var(--secondary);
		color: var(--primary);
	}
</style>
