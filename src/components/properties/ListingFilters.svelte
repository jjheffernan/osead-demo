<script lang="ts">
	import { onMount } from "svelte";

	type ListingType = "sale" | "rental" | "both";

	export interface SerializedProperty {
		slug: string;
		title: string;
		regionLabel: string;
		market: string;
		waterfront: string;
		beds: number;
		baths: number;
		sleeps?: number;
		listingType: ListingType;
		amenities: string[];
		petsAllowed?: boolean;
		priceDisplay?: string;
		image?: { src: string; alt: string };
	}

	interface Props {
		listings: SerializedProperty[];
		listingType?: Exclude<ListingType, "both">;
	}

	const amenityFilters = [
		{ label: "Pool", matches: /(?:private|community) pool/i },
		{ label: "Hot tub", matches: /hot tub/i },
		{ label: "Elevator", matches: /elevator/i },
		{ label: "Beach access", matches: /beach access/i },
	];

	const emptyStateCollections = [
		{ href: "/collections/oceanfront", label: "Oceanfront" },
		{ href: "/collections/pets", label: "Pet-friendly" },
		{ href: "/collections/large-groups", label: "Large groups" },
	] as const;

	let { listings, listingType }: Props = $props();

	let minimumBeds = $state<number | null>(null);
	let minimumBaths = $state<number | null>(null);
	let waterfront = $state("");
	let market = $state("");
	let petsOnly = $state(false);
	let selectedAmenities = $state<string[]>([]);
	let selectedListingType = $state<ListingType | "">("");

	const bedOptions = $derived([...new Set(listings.map((property) => property.beds))].sort((a, b) => a - b));
	const bathOptions = $derived([...new Set(listings.map((property) => property.baths))].sort((a, b) => a - b));
	const activeListingType = $derived(listingType ?? selectedListingType);
	const waterfrontOptions = $derived(
		[...new Set(listings.map((property) => property.waterfront))].sort(),
	);
	const marketOptions = $derived(
		[...new Set(listings.map((property) => property.market))].sort(),
	);
	const availableAmenities = $derived(
		amenityFilters.filter((filter) =>
			listings.some((property) => property.amenities.some((amenity) => filter.matches.test(amenity))),
		),
	);
	const canFilterListingType = $derived(
		listingType === undefined &&
			listings.some((property) => property.listingType !== "rental") &&
			listings.some((property) => property.listingType !== "sale"),
	);
	const hasActiveFilters = $derived(
		minimumBeds !== null ||
			minimumBaths !== null ||
			waterfront !== "" ||
			market !== "" ||
			petsOnly ||
			selectedAmenities.length > 0 ||
			selectedListingType !== "",
	);
	const activeFilterChips = $derived.by(() => {
		const chips: { key: string; label: string }[] = [];

		if (minimumBeds !== null) {
			const suffix = minimumBeds === bedOptions.at(-1) ? "+" : "";
			chips.push({ key: "beds", label: `${minimumBeds}${suffix} beds` });
		}
		if (minimumBaths !== null) {
			const suffix = minimumBaths === bathOptions.at(-1) ? "+" : "";
			chips.push({ key: "baths", label: `${minimumBaths}${suffix} baths` });
		}
		if (waterfront !== "") {
			chips.push({ key: "waterfront", label: formatWaterfront(waterfront) });
		}
		if (market !== "") {
			chips.push({ key: "market", label: formatMarket(market) });
		}
		if (petsOnly) {
			chips.push({ key: "pets", label: "Pets welcome" });
		}
		if (selectedListingType !== "") {
			chips.push({
				key: "listing-type",
				label: selectedListingType === "rental" ? "Weekly rentals" : "Homes for sale",
			});
		}
		for (const label of selectedAmenities) {
			chips.push({ key: `amenity:${label}`, label });
		}

		return chips;
	});
	const filteredProperties = $derived(
		listings.filter(
			(property) =>
				(minimumBeds === null || property.beds >= minimumBeds) &&
				(minimumBaths === null || property.baths >= minimumBaths) &&
				(waterfront === "" || property.waterfront === waterfront) &&
				(market === "" || property.market === market) &&
				(!petsOnly || property.petsAllowed === true) &&
				(activeListingType === "" ||
					property.listingType === "both" ||
					property.listingType === activeListingType) &&
				selectedAmenities.every((label) => {
					const filter = amenityFilters.find((candidate) => candidate.label === label);
					return filter && property.amenities.some((amenity) => filter.matches.test(amenity));
				}),
		),
	);

	function clearFilters() {
		minimumBeds = null;
		minimumBaths = null;
		waterfront = "";
		market = "";
		petsOnly = false;
		selectedAmenities = [];
		selectedListingType = "";
	}

	function clearFilterDimension(key: string) {
		switch (key) {
			case "beds":
				minimumBeds = null;
				break;
			case "baths":
				minimumBaths = null;
				break;
			case "waterfront":
				waterfront = "";
				break;
			case "market":
				market = "";
				break;
			case "pets":
				petsOnly = false;
				break;
			case "listing-type":
				selectedListingType = "";
				break;
			default:
				if (key.startsWith("amenity:")) {
					const label = key.slice("amenity:".length);
					selectedAmenities = selectedAmenities.filter((amenity) => amenity !== label);
				}
		}
	}

	function formatWaterfront(value: string) {
		return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
	}

	function formatMarket(value: string) {
		return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
	}

	function applyQueryParams() {
		const query = new URLSearchParams(window.location.search);
		const beds = query.get("beds");
		const baths = query.get("baths");
		const water = query.get("waterfront");
		const marketParam = query.get("market");
		const amenities = query.getAll("amenity");

		if (beds && !Number.isNaN(Number(beds))) minimumBeds = Number(beds);
		if (baths && !Number.isNaN(Number(baths))) minimumBaths = Number(baths);
		if (water) waterfront = water;
		if (marketParam) market = marketParam;
		if (query.get("pets") === "1") petsOnly = true;
		if (amenities.length) {
			const known = new Set(amenityFilters.map((item) => item.label));
			selectedAmenities = amenities
				.map((value) => {
					const hit = amenityFilters.find((item) =>
						item.matches.test(value) || item.label.toLowerCase() === value.toLowerCase(),
					);
					return hit?.label ?? (known.has(value) ? value : null);
				})
				.filter((value): value is string => Boolean(value));
		}
	}

	onMount(applyQueryParams);
</script>

<section class="listing-filters" aria-label="Filter properties">
	<div class="listing-filters__bar">
		<div>
			<p class="listing-filters__eyebrow">Refine the collection</p>
			<p class="listing-filters__count" aria-live="polite">
				{filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
			</p>
		</div>
		{#if hasActiveFilters}
			<button class="listing-filters__clear" type="button" onclick={clearFilters}>Clear filters</button>
		{/if}
	</div>

	<form class="listing-filters__controls" onsubmit={(event) => event.preventDefault()}>
		<label class="listing-filters__field">
			<span>Bedrooms</span>
			<select bind:value={minimumBeds}>
				<option value={null}>Any</option>
				{#each bedOptions as beds (beds)}
					<option value={beds}>{beds}{beds === bedOptions.at(-1) ? "+" : ""} beds</option>
				{/each}
			</select>
		</label>

		<label class="listing-filters__field">
			<span>Bathrooms</span>
			<select bind:value={minimumBaths}>
				<option value={null}>Any</option>
				{#each bathOptions as baths (baths)}
					<option value={baths}>{baths}{baths === bathOptions.at(-1) ? "+" : ""} baths</option>
				{/each}
			</select>
		</label>

		<label class="listing-filters__field">
			<span>Waterfront</span>
			<select bind:value={waterfront}>
				<option value="">Any setting</option>
				{#each waterfrontOptions as option (option)}
					<option value={option}>{formatWaterfront(option)}</option>
				{/each}
			</select>
		</label>

		<label class="listing-filters__field">
			<span>Market</span>
			<select bind:value={market}>
				<option value="">Any market</option>
				{#each marketOptions as option (option)}
					<option value={option}>{formatMarket(option)}</option>
				{/each}
			</select>
		</label>

		{#if canFilterListingType}
			<label class="listing-filters__field">
				<span>Collection</span>
				<select bind:value={selectedListingType}>
					<option value="">All listings</option>
					<option value="rental">Weekly rentals</option>
					<option value="sale">Homes for sale</option>
				</select>
			</label>
		{/if}

		<label class="listing-filters__chip listing-filters__pets">
			<input type="checkbox" bind:checked={petsOnly} />
			<span>Pets welcome</span>
		</label>

		{#if availableAmenities.length}
			<fieldset class="listing-filters__amenities">
				<legend>Considered essentials</legend>
				<div>
					{#each availableAmenities as amenity (amenity.label)}
						<label class="listing-filters__chip">
							<input type="checkbox" value={amenity.label} bind:group={selectedAmenities} />
							<span>{amenity.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
		{/if}
	</form>

	{#if activeFilterChips.length}
		<div class="listing-filters__active" aria-label="Active filters">
			{#each activeFilterChips as chip (chip.key)}
				<button
					type="button"
					class="listing-filters__active-chip"
					aria-label={`Remove ${chip.label} filter`}
					onclick={() => clearFilterDimension(chip.key)}
				>
					<span>{chip.label}</span>
					<span class="listing-filters__active-chip-remove" aria-hidden="true">×</span>
				</button>
			{/each}
		</div>
	{/if}

	<div class="property-grid">
		{#each filteredProperties as property (property.slug)}
			<article class="property-card">
				<a class="property-card__link" href={`/properties/${property.slug}`}>
					{#if property.image}
						<img
							class="property-card__image"
							src={property.image.src}
							alt={property.image.alt}
							loading="lazy"
							width="800"
							height="500"
						/>
					{/if}
					<div class="property-card__body">
						<p class="property-card__market">{property.regionLabel}</p>
						<h2 class="property-card__title">{property.title}</h2>
						<p class="property-card__meta">
							{property.beds} beds · {property.baths} baths{property.sleeps
								? ` · Sleeps ${property.sleeps}`
								: ""} · {formatWaterfront(property.waterfront)}
						</p>
						{#if property.priceDisplay}
							<p class="property-card__price">{property.priceDisplay}</p>
						{/if}
					</div>
				</a>
			</article>
		{:else}
			<div class="listing-filters__empty">
				<p>No properties match these preferences. Try broadening the brief.</p>
				{#if hasActiveFilters}
					<button class="listing-filters__clear" type="button" onclick={clearFilters}>
						Clear filters
					</button>
				{/if}
				<p class="listing-filters__empty-hint">Or browse a curated collection:</p>
				<ul class="listing-filters__empty-links">
					{#each emptyStateCollections as link (link.href)}
						<li>
							<a href={link.href}>{link.label}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<style>
	.listing-filters {
		margin-top: var(--spacing-5);
	}

	.listing-filters__bar {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: var(--spacing-4);
		margin-bottom: var(--spacing-4);
	}

	.listing-filters__eyebrow,
	.listing-filters__count {
		margin: 0;
	}

	.listing-filters__eyebrow {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.listing-filters__count {
		margin-top: var(--spacing-1);
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-medium);
	}

	.listing-filters__clear {
		border: 0;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		font-size: var(--text-sm);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.listing-filters__controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-3);
		padding-block: var(--spacing-3);
		border-block: 1px solid var(--border);
	}

	.listing-filters__field {
		display: grid;
		gap: var(--spacing-1);
		min-width: 10rem;
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.listing-filters select {
		appearance: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--card);
		color: var(--foreground);
		padding: var(--spacing-2) var(--spacing-6) var(--spacing-2) var(--spacing-3);
		font: inherit;
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-normal);
		text-transform: none;
		cursor: pointer;
	}

	.listing-filters__amenities {
		display: grid;
		gap: var(--spacing-2);
		margin: 0;
		padding: 0;
		border: 0;
	}

	.listing-filters__amenities legend {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.listing-filters__amenities > div {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
	}

	.listing-filters__chip {
		position: relative;
		display: inline-flex;
		cursor: pointer;
	}

	.listing-filters__chip input {
		position: absolute;
		opacity: 0;
	}

	.listing-filters__chip span {
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--secondary);
		color: var(--secondary-foreground);
		padding: var(--spacing-2) var(--spacing-3);
		font-size: var(--text-sm);
	}

	.listing-filters__chip input:checked + span {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.listing-filters__chip input:focus-visible + span,
	.listing-filters select:focus-visible,
	.listing-filters__clear:focus-visible,
	.listing-filters__active-chip:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.listing-filters__active {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
		margin-top: var(--spacing-3);
	}

	.listing-filters__active-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		border: 1px solid var(--primary);
		border-radius: var(--radius-full);
		background: var(--primary);
		color: var(--primary-foreground);
		padding: var(--spacing-1) var(--spacing-2) var(--spacing-1) var(--spacing-3);
		font: inherit;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.listing-filters__active-chip-remove {
		font-size: var(--text-lg);
		line-height: 1;
	}

	.property-grid {
		display: grid;
		gap: var(--spacing-7);
		grid-template-columns: repeat(auto-fill, minmax(17.5rem, 1fr));
		margin-top: var(--spacing-7);
	}

	.property-card__link {
		display: grid;
		gap: var(--spacing-3);
		color: inherit;
		text-decoration: none;
	}

	.property-card__image {
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		background: var(--muted);
	}

	.property-card__market,
	.property-card__meta,
	.property-card__price {
		margin: 0;
	}

	.property-card__market {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}

	.property-card__title {
		margin: var(--spacing-1) 0;
		font-size: var(--text-xl);
		line-height: var(--leading-tight);
	}

	.property-card__meta {
		color: var(--muted-foreground);
		font-size: var(--text-sm);
	}

	.property-card__price {
		margin-top: var(--spacing-2);
		font-weight: var(--font-weight-semibold);
	}

	.listing-filters__empty {
		display: grid;
		gap: var(--spacing-3);
		justify-items: start;
		margin: 0;
		color: var(--muted-foreground);
	}

	.listing-filters__empty p {
		margin: 0;
	}

	.listing-filters__empty-hint {
		margin-top: var(--spacing-2);
		font-size: var(--text-sm);
	}

	.listing-filters__empty-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2) var(--spacing-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.listing-filters__empty-links a {
		color: var(--foreground);
		font-size: var(--text-sm);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	@media (width < 40rem) {
		.listing-filters__bar {
			align-items: start;
			flex-direction: column;
		}

		.listing-filters__field {
			flex: 1 1 100%;
		}
	}
</style>
