<script lang="ts">
	export interface GalleryImage {
		src: string;
		alt: string;
	}

	export interface GalleryVideo {
		src: string;
		title?: string;
		poster?: string;
		provider?: "file" | "youtube";
	}

	type MediaPhoto = { kind: "photo"; src: string; alt: string };
	type MediaVideo = {
		kind: "video";
		src: string;
		title: string;
		poster?: string;
		provider: "file" | "youtube";
	};
	type MediaItem = MediaPhoto | MediaVideo;

	interface Props {
		images: GalleryImage[];
		videos?: GalleryVideo[];
		label?: string;
	}

	let { images, videos = [], label = "Property gallery" }: Props = $props();

	let selectedIndex = $state(0);

	const media = $derived.by((): MediaItem[] => [
		...images.map(
			(image): MediaPhoto => ({
				kind: "photo",
				src: image.src,
				alt: image.alt,
			}),
		),
		...videos.map(
			(video): MediaVideo => ({
				kind: "video",
				src: video.src,
				title: video.title?.trim() || "Video",
				poster: video.poster,
				provider: video.provider ?? "file",
			}),
		),
	]);

	const count = $derived(media.length);
	const selected = $derived(media[selectedIndex] ?? null);
	const captionLabel = $derived(
		selected?.kind === "photo" ? selected.alt : (selected?.title ?? ""),
	);
	const typeLabel = $derived(selected?.kind === "photo" ? "Photo" : "Video");
	const caption = $derived(
		selected ? `${selectedIndex + 1} of ${count}` : "",
	);

	function youtubeId(src: string): string {
		const trimmed = src.trim();
		if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
		try {
			const url = new URL(trimmed);
			if (url.hostname.includes("youtu.be")) {
				return url.pathname.split("/").filter(Boolean)[0] ?? "";
			}
			const v = url.searchParams.get("v");
			if (v) return v;
			const parts = url.pathname.split("/").filter(Boolean);
			const embedIdx = parts.indexOf("embed");
			if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
			const shortsIdx = parts.indexOf("shorts");
			if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
		} catch {
			/* bare or malformed — fall through */
		}
		return trimmed;
	}

	function select(index: number) {
		if (count === 0) return;
		selectedIndex = ((index % count) + count) % count;
	}

	function itemLabel(item: MediaItem, index: number): string {
		const name = item.kind === "photo" ? item.alt : item.title;
		const kind = item.kind === "photo" ? "Photo" : "Video";
		return `${kind} ${index + 1}: ${name}`;
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
			{#if selected.kind === "photo"}
				<img
					class="gallery__image"
					src={selected.src}
					alt={selected.alt}
					width="1600"
					height="1000"
				/>
			{:else if selected.provider === "youtube"}
				{@const id = youtubeId(selected.src)}
				<div class="gallery__video">
					<iframe
						title={selected.title}
						src={`https://www.youtube-nocookie.com/embed/${id}`}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						loading="lazy"
						referrerpolicy="strict-origin-when-cross-origin"
					></iframe>
				</div>
			{:else}
				<video
					class="gallery__image"
					controls
					playsinline
					preload="none"
					poster={selected.poster}
				>
					<source src={selected.src} />
				</video>
			{/if}
			<figcaption class="gallery__caption">
				<span class="gallery__eyebrow">{typeLabel}</span>
				<span class="gallery__alt">{captionLabel}</span>
				{#if count > 1}
					<span class="gallery__count" aria-live="polite">{caption}</span>
				{/if}
			</figcaption>
		</figure>

		{#if count > 1}
			<div class="gallery__nav">
				<button type="button" onclick={() => select(selectedIndex - 1)}>
					Previous
				</button>
				<button type="button" onclick={() => select(selectedIndex + 1)}>
					Next
				</button>
			</div>

			<div
				class="gallery__thumbs"
				role="tablist"
				aria-label="Select media"
			>
				{#each media as item, index (item.kind + item.src + index)}
					<button
						type="button"
						class="gallery__thumb"
						class:gallery__thumb--selected={index === selectedIndex}
						role="tab"
						aria-selected={index === selectedIndex}
						aria-label={itemLabel(item, index)}
						tabindex={index === selectedIndex ? 0 : -1}
						onclick={() => select(index)}
						onkeydown={(event) => onThumbKeydown(event, index)}
					>
						{#if item.kind === "photo"}
							<img src={item.src} alt="" width="320" height="200" loading="lazy" />
						{:else if item.poster}
							<img src={item.poster} alt="" width="320" height="200" loading="lazy" />
						{:else}
							<span class="gallery__thumb-label">Video</span>
						{/if}
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

	.gallery__video {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--muted);
	}

	.gallery__video iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
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

	.gallery__thumb-label {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
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
