<script lang="ts">
	import type { PropertyCardData } from "../../lib/properties";

	interface Props {
		property: PropertyCardData;
		/** Larger image plane for home featured grids */
		featured?: boolean;
	}

	const { property, featured = false }: Props = $props();

	const meta = $derived(
		[
			`${property.beds} beds`,
			`${property.baths} baths`,
			property.sleeps ? `Sleeps ${property.sleeps}` : null,
			property.waterfront.replace(/-/g, " "),
		]
			.filter(Boolean)
			.join(" · "),
	);
</script>

<article class="property-card" class:property-card--featured={featured}>
	<a class="property-card__link" href={property.href}>
		{#if property.image}
			<img
				class="property-card__image"
				src={property.image.src}
				alt={property.image.alt}
				loading="lazy"
				width="800"
				height={featured ? 600 : 500}
			/>
		{/if}
		<div class="property-card__body">
			<p class="property-card__market">{property.regionLabel}</p>
			<h3 class="property-card__title">{property.title}</h3>
			<p class="property-card__meta">{meta}</p>
			{#if property.priceDisplay}
				<p class="property-card__price">{property.priceDisplay}</p>
			{/if}
		</div>
	</a>
</article>

<style>
	.property-card {
		display: block;
	}

	.property-card__link {
		display: grid;
		gap: 0.85rem;
		color: inherit;
		text-decoration: none;
	}

	.property-card__image {
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		background: var(--muted);
	}

	.property-card--featured .property-card__image {
		aspect-ratio: 4 / 3;
	}

	.property-card--featured .property-card__title {
		font-size: clamp(1.25rem, 2vw, 1.45rem);
	}

	.property-card__market {
		margin: 0;
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.property-card__title {
		margin: 0.15rem 0;
		font-size: 1.25rem;
		line-height: 1.25;
	}

	.property-card__meta,
	.property-card__price {
		margin: 0;
	}

	.property-card__meta {
		color: var(--muted-foreground);
		font-size: 0.95rem;
	}

	.property-card__price {
		margin-top: 0.35rem;
		font-weight: 600;
	}
</style>
