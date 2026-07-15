<script lang="ts">
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";

	interface Props {
		url: string;
		title: string;
		locale?: Locale;
	}

	const { url, title, locale = "en" }: Props = $props();
	const shareText = $derived(encodeURIComponent(title));
	const encodedUrl = $derived(encodeURIComponent(url));

	// Never changes after mount, so a plain const (re-evaluated per hydrated
	// instance) is enough — no reactivity needed.
	const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

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

	<a
		class="share-buttons__btn"
		href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
		target="_blank"
		rel="noreferrer"
		aria-label="Share on X"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
		</svg>
		X
	</a>

	<a
		class="share-buttons__btn"
		href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
		target="_blank"
		rel="noreferrer"
		aria-label="Share on LinkedIn"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
			<rect width="4" height="12" x="2" y="9" />
			<circle cx="4" cy="4" r="2" />
		</svg>
		LinkedIn
	</a>

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

	@media (prefers-reduced-motion: reduce) {
		.share-buttons__btn {
			transition: none;
		}
	}
</style>
