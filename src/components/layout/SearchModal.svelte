<script lang="ts">
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";
	import Dialog from "../ui/overlay/Dialog/Dialog.svelte";

	interface Props {
		locale?: Locale;
	}

	const { locale = "en" }: Props = $props();
	const isProd = import.meta.env.PROD;

	type PagefindWindow = typeof window & {
		PagefindUI?: new (options: Record<string, unknown>) => unknown;
		__pagefindUI?: unknown;
	};

	let open = $state(false);
	let pagefindInitialized = false;
	let pagefindLoading: Promise<void> | null = null;

	function loadPagefind(): Promise<void> {
		if (pagefindLoading) return pagefindLoading;
		pagefindLoading = new Promise((resolve) => {
			const css = document.createElement("link");
			css.rel = "stylesheet";
			css.href = "/pagefind/pagefind-ui.css";
			document.head.appendChild(css);

			const script = document.createElement("script");
			script.src = "/pagefind/pagefind-ui.js";
			script.onload = () => resolve();
			script.onerror = () => resolve();
			document.head.appendChild(script);
		});
		return pagefindLoading;
	}

	async function openSearch() {
		open = true;

		await loadPagefind();

		const pagefindMount = document.querySelector("[data-pagefind-ui]");
		if (!pagefindMount) return;

		const win = window as PagefindWindow;
		if (win.PagefindUI && !pagefindInitialized) {
			pagefindInitialized = true;
			win.__pagefindUI = new win.PagefindUI({
				element: "[data-pagefind-ui]",
				showSubResults: true,
				autofocus: true,
			});
		}
	}

	function closeSearch() {
		open = false;
	}

	$effect(() => {
		const triggers = document.querySelectorAll<HTMLElement>(
			"[data-search-trigger]",
		);
		triggers.forEach((trigger) =>
			trigger.addEventListener("click", openSearch),
		);

		const onKeydown = (event: KeyboardEvent) => {
			const isShortcut =
				(event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
			if (isShortcut) {
				event.preventDefault();
				openSearch();
			}
		};
		document.addEventListener("keydown", onKeydown);

		return () => {
			triggers.forEach((trigger) =>
				trigger.removeEventListener("click", openSearch),
			);
			document.removeEventListener("keydown", onKeydown);
		};
	});
</script>

<Dialog
	bind:open
	labelledBy="search-modal-title"
	class="search-modal"
>
	<div class="search-modal__panel">
		<div class="search-modal__header">
			<span class="search-modal__eyebrow">
				<svg
					class="search-modal__eyebrow-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<h2 id="search-modal-title" class="search-modal__title">
					{t(locale, "search.title")}
				</h2>
			</span>
			<button
				type="button"
				class="search-modal__close"
				onclick={closeSearch}
				aria-label={t(locale, "aria.closeModal")}
			>
				<kbd class="search-modal__kbd">Esc</kbd>
				<svg
					class="search-modal__close-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>

		{#if isProd}
			<div class="search-modal__ui" data-pagefind-ui></div>
		{:else}
			<p class="search-modal__fallback">{t(locale, "search.devFallback")}</p>
		{/if}
	</div>
</Dialog>

<style>
	.search-modal__panel {
		display: flex;
		flex-direction: column;
		max-height: inherit;
		padding: var(--space-md) var(--space-lg) var(--space-lg);
	}

	.search-modal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding-bottom: var(--space-sm);
		margin-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.search-modal__eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: var(--color-text-secondary);
	}

	.search-modal__eyebrow-icon {
		width: 1.05rem;
		height: 1.05rem;
	}

	.search-modal__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--color-text-primary);
	}

	.search-modal__close {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 2rem;
		padding-inline: 0.4rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;
	}

	.search-modal__close:hover {
		border-color: var(--color-text-primary);
		color: var(--color-text-primary);
		background: var(--color-bg-secondary);
	}

	.search-modal__close-icon {
		width: 1rem;
		height: 1rem;
	}

	.search-modal__kbd {
		font-family: inherit;
		font-size: 0.7rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.search-modal__fallback {
		margin: 0;
		color: var(--color-text-secondary);
	}

	.search-modal__ui {
		--pagefind-ui-scale: 0.85;
		--pagefind-ui-primary: var(--color-text-primary);
		--pagefind-ui-text: var(--color-text-primary);
		--pagefind-ui-background: var(--color-bg-primary);
		--pagefind-ui-border: var(--color-border);
		--pagefind-ui-tag: var(--color-bg-secondary);
		--pagefind-ui-border-width: 1px;
		--pagefind-ui-border-radius: var(--radius-lg);
		--pagefind-ui-font: inherit;

		overflow-y: auto;
	}
</style>
