<script lang="ts">
	import type { MarketplaceLink } from "../../config/marketplaces";

	interface Props {
		eyebrow: string;
		title: string;
		lead: string;
		links: MarketplaceLink[];
		id?: string;
	}

	const { eyebrow, title, lead, links, id }: Props = $props();
</script>

<section class="markets" {id} aria-labelledby={`${id ?? "markets"}-title`}>
	<div class="markets__inner container">
		<header class="markets__head">
			<p class="markets__eyebrow">{eyebrow}</p>
			<h2 id={`${id ?? "markets"}-title`}>{title}</h2>
			<p class="markets__lead">{lead}</p>
		</header>
		<ul class="markets__grid">
			{#each links as link (link.href)}
				<li>
					<a
						class="markets__link"
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
					>
						<span class="markets__name">{link.name}</span>
						<span class="markets__blurb">{link.blurb}</span>
						<span class="markets__cta" aria-hidden="true">Visit →</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.markets {
		border-block: 1px solid var(--border);
		background: var(--card);
		padding-block: clamp(2rem, 4vw, 3.25rem);
	}

	.markets__head {
		max-width: 42rem;
		margin-bottom: var(--spacing-5);
	}

	.markets__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.markets h2 {
		margin: 0.4rem 0 0;
		font-size: var(--heading-h3);
		letter-spacing: var(--tracking-tight);
		color: var(--foreground);
	}

	.markets__lead {
		margin: 0.65rem 0 0;
		color: var(--muted-foreground);
		line-height: var(--leading-relaxed);
	}

	.markets__grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.65rem;
		grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr));
	}

	.markets__link {
		display: grid;
		gap: 0.35rem;
		min-height: 100%;
		padding: 0.85rem 0.95rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: inherit;
		text-decoration: none;
	}

	.markets__link:hover {
		border-color: var(--foreground);
	}

	.markets__name {
		font-weight: var(--font-weight-bold);
		color: var(--foreground);
	}

	.markets__blurb,
	.markets__cta {
		font-size: var(--text-sm);
		color: var(--muted-foreground);
		line-height: 1.4;
	}

	.markets__cta {
		margin-top: 0.25rem;
		font-weight: var(--font-weight-bold);
		color: var(--foreground);
	}
</style>
