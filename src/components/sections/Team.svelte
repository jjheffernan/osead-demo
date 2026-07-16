<script lang="ts">
	/**
	 * Team — dense people strip (monogram avatars, no external images).
	 */
	export interface Member {
		name: string;
		role?: string;
		bio?: string;
	}

	interface Props {
		title?: string;
		description?: string;
		members: Member[];
	}

	const { title, description, members }: Props = $props();

	function initials(name: string): string {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("");
	}
</script>

<section class="team container">
	{#if title || description}
		<header class="section-head">
			{#if title}<h2 class="section-head__title">{title}</h2>{/if}
			{#if description}<p class="section-head__lead">{description}</p>{/if}
		</header>
	{/if}

	<ul class="team__grid">
		{#each members as member (member.name)}
			<li class="team__card">
				<span class="team__avatar" aria-hidden="true">
					{initials(member.name)}
				</span>
				<p class="team__name">{member.name}</p>
				{#if member.role}<p class="team__role">{member.role}</p>{/if}
				{#if member.bio}<p class="team__bio">{member.bio}</p>{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.team {
		padding-block: clamp(1.25rem, 3vw, 2rem);
	}

	.team__grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-md);
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}

	.team__card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
		gap: 0.25rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--border);
		background: transparent;
		box-shadow: none;
		border-radius: 0;
	}

	.team__avatar {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-bottom: 0.35rem;
		border-radius: var(--radius-sm);
		background: var(--secondary);
		color: var(--foreground);
		font-weight: 700;
		font-size: 0.95rem;
	}

	.team__name {
		margin: 0;
		font-weight: 600;
	}

	.team__role {
		margin: 0;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.team__bio {
		margin: 0.4rem 0 0;
		color: var(--muted-foreground);
		font-size: 0.9rem;
		line-height: 1.55;
	}
</style>
