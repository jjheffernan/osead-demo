<script lang="ts">
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";
	import Popover from "../ui/overlay/Popover/Popover.svelte";

	interface Props {
		url: string;
		title: string;
		locale?: Locale;
	}

	const { url, title, locale = "en" }: Props = $props();
	const shareText = $derived(encodeURIComponent(title));
	const encodedUrl = $derived(encodeURIComponent(url));
	const popoverId = "share-more";

	const canNativeShare =
		typeof navigator !== "undefined" && "share" in navigator;

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	async function nativeShare() {
		try {
			await navigator.share({ title, url });
		} catch {
			// user dismissed the share sheet
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			const ta = document.createElement("textarea");
			ta.value = url;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			ta.remove();
		}
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="share-buttons" role="group" aria-label={t(locale, "blog.share")}>
	<span class="share-buttons__label">{t(locale, "blog.share")}</span>

	{#if canNativeShare}
		<button type="button" class="share-buttons__btn" onclick={nativeShare}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="18" cy="5" r="3" />
				<circle cx="6" cy="12" r="3" />
				<circle cx="18" cy="19" r="3" />
				<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
				<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
			</svg>
			{t(locale, "blog.share")}
		</button>
	{/if}

	<button
		type="button"
		class="share-buttons__btn"
		class:is-copied={copied}
		onclick={copyLink}
		aria-label={t(locale, "blog.copyLink")}
	>
		{#if copied}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M20 6 9 17l-5-5" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
				<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
			</svg>
		{/if}
		<span>{copied ? "Copied!" : t(locale, "blog.copyLink")}</span>
	</button>

	<Popover id={popoverId} align="end">
		{#snippet trigger()}
			<span class="share-buttons__btn share-buttons__more">More</span>
		{/snippet}
		<a
			class="share-buttons__menu-item"
			href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
			target="_blank"
			rel="noreferrer"
		>
			Share on X
		</a>
		<a
			class="share-buttons__menu-item"
			href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
			target="_blank"
			rel="noreferrer"
		>
			Share on LinkedIn
		</a>
	</Popover>
</div>

<style>
	.share-buttons {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.share-buttons__label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-right: var(--space-xs);
	}

	.share-buttons__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0.5rem 0.85rem;
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			color 0.15s ease;
	}

	.share-buttons__btn :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.share-buttons__btn:hover {
		border-color: var(--color-text-secondary);
		background: var(--color-bg-secondary);
	}

	.share-buttons__btn:focus-visible {
		outline: 2px solid var(--color-brand-primary);
		outline-offset: 2px;
	}

	.share-buttons__btn.is-copied {
		border-color: var(--color-text-primary);
		color: var(--color-text-primary);
	}

	.share-buttons__menu-item {
		display: block;
		padding: 0.45rem 0.55rem;
		border-radius: var(--radius-md);
		color: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
	}

	.share-buttons__menu-item:hover {
		background: var(--color-bg-tertiary);
	}

	@media (prefers-reduced-motion: reduce) {
		.share-buttons__btn {
			transition: none;
		}
	}
</style>
