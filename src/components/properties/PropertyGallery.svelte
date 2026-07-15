<script lang="ts">
	export interface GalleryImage {
		src: string;
		alt: string;
	}

	interface Props {
		images: GalleryImage[];
		label?: string;
	}

	let { images, label = "Property gallery" }: Props = $props();

	let selectedIndex = $state(0);

	const count = $derived(images.length);
	const selected = $derived(images[selectedIndex] ?? null);
	const caption = $derived(
		selected ? `${selectedIndex + 1} of ${count}` : "",
	);

	function select(index: number) {
		if (count === 0) return;
		selectedIndex = ((index % count) + count) % count;
	}

	function onThumbKeydown(event: KeyboardEvent, index: number) {
		if (count < 2) return;
		let next: number | null = null;
		switch (event.key) {
			case "ArrowLeft":
			case "ArrowUp":
				next = index - 1;
				break;
			case "ArrowRight":
			case "ArrowDown":
				next = index + 1;
				break;
			case "Home":
				next = 0;
				break;
			case "End":
				next = count - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		event.stopPropagation();
		const wrapped = ((next % count) + count) % count;
		select(wrapped);
		const list = (event.currentTarget as HTMLButtonElement).parentElement;
		queueMicrotask(() => {
			(list?.children[wrapped] as HTMLElement | undefined)?.focus();
		});
	}
</script>

{#if selected}
	<section class="gallery" aria-label={label}>
		<figure class="gallery__stage">
			<img
				class="gallery__image"
				src={selected.src}
				alt={selected.alt}
				width="1600"
				height="1000"
			/>
			<figcaption class="gallery__caption">
				<span class="gallery__eyebrow">Views</span>
				<span class="gallery__alt">{selected.alt}</span>
				{#if count > 1}
					<span class="gallery__count" aria-live="polite">{caption}</span>
				{/if}
			</figcaption>
		</figure>

		{#if count > 1}
			<div class="gallery__nav">
				<button type="button" onclick={() => select(selectedIndex - 1)}>
					Previous view
				</button>
				<button type="button" onclick={() => select(selectedIndex + 1)}>
					Next view
				</button>
			</div>

			<div
				class="gallery__thumbs"
				role="tablist"
				aria-label="Select a view"
			>
				{#each images as image, index (image.src + index)}
					<button
						type="button"
						class="gallery__thumb"
						class:gallery__thumb--selected={index === selectedIndex}
						role="tab"
						aria-selected={index === selectedIndex}
						aria-label={`View ${index + 1}: ${image.alt}`}
						tabindex={index === selectedIndex ? 0 : -1}
						onclick={() => select(index)}
						onkeydown={(event) => onThumbKeydown(event, index)}
					>
						<img src={image.src} alt="" width="320" height="200" loading="lazy" />
					</button>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.gallery {
		margin-bottom: var(--spacing-7);
	}

	.gallery__stage {
		margin: 0;
	}

	.gallery__nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-4);
		margin-top: var(--spacing-3);
	}

	.gallery__nav button {
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		font-size: var(--text-sm);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.gallery__nav button:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.gallery__image {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		background: var(--muted);
	}

	.gallery__caption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--spacing-2) var(--spacing-4);
		margin-top: var(--spacing-3);
	}

	.gallery__eyebrow {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.gallery__alt {
		flex: 1 1 12rem;
		color: var(--foreground);
		font-family: var(--font-heading);
		font-size: var(--text-base);
		line-height: var(--leading-snug);
	}

	.gallery__count {
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.gallery__thumbs {
		display: flex;
		gap: var(--spacing-2);
		margin-top: var(--spacing-4);
		overflow-x: auto;
		padding-block: var(--spacing-1);
	}

	.gallery__thumb {
		flex: 0 0 auto;
		width: 5.5rem;
		padding: 0;
		border: 1px solid var(--border);
		background: var(--muted);
		cursor: pointer;
	}

	.gallery__thumb img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
	}

	.gallery__thumb--selected {
		border-color: var(--foreground);
		outline: 1px solid var(--foreground);
		outline-offset: 1px;
	}

	.gallery__thumb:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}
</style>
