<script lang="ts">
	/**
	 * Secondary intent-hub links (not market-primary nav).
	 */
	const links = [
		{ href: "/collections/oceanfront", label: "Oceanfront" },
		{ href: "/collections/pets", label: "Pet-friendly" },
		{ href: "/collections/large-groups", label: "Large groups" },
		{ href: "/collections/elevators", label: "Elevators" },
	] as const;
</script>

<nav class="collection-links" aria-label="Browse by intent">
	<p class="collection-links__label">
		Browse by intent · <a href="/collections">All collections</a>
	</p>
	<ul>
		{#each links as link (link.href)}
			<li>
				<a href={link.href}>{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.collection-links {
		margin: 1.5rem 0 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
	}

	.collection-links__label {
		margin: 0 0 0.75rem;
		color: var(--muted-foreground);
		font-size: 0.9rem;
	}

	.collection-links__label a {
		color: inherit;
	}

	.collection-links ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
	}

	.collection-links a {
		color: var(--foreground);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>
