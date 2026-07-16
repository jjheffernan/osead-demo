<script lang="ts">
	import Tabs from "../ui/navigation/Tabs/Tabs.svelte";
	import RatingSubmit from "./RatingSubmit.svelte";

	interface Props {
		staffId?: string;
		staffLabel?: string;
	}

	const {
		staffId = "mara-ellison",
		staffLabel = "Rate a team member (demo: Mara)",
	}: Props = $props();

	let value = $state("staff");
</script>

{#snippet staff()}
	<header class="rating-tabs__head">
		<h2>Rate a team member</h2>
		<p>
			Submissions become inquiry leads — nothing is published live on this demo.
		</p>
	</header>
	<RatingSubmit targetType="staff" targetId={staffId} label={staffLabel} />
{/snippet}

{#snippet office()}
	<header class="rating-tabs__head">
		<h2>Rate the office</h2>
		<p>
			How was working with O-sea-D overall? Same demo path — inquiry only, not
			published live.
		</p>
	</header>
	<RatingSubmit
		targetType="business"
		targetId="osead"
		label="Rate the O-sea-D office"
	/>
{/snippet}

<section class="rating-tabs container">
	<Tabs
		bind:value
		label="Rating forms"
		tabs={[
			{ value: "staff", label: "Team member", panel: staff },
			{ value: "office", label: "Office", panel: office },
		]}
	/>
</section>

<style>
	.rating-tabs {
		padding-block: 1.35rem 1.75rem;
	}

	.rating-tabs__head h2 {
		margin: 0;
		font-size: 1.35rem;
	}

	.rating-tabs__head p {
		margin: 0.4rem 0 1rem;
		color: var(--muted-foreground);
		max-width: 42ch;
		line-height: 1.5;
	}
</style>
