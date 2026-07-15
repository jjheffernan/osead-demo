<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";
	import { resolveRoute, detectLocale, stripLocale } from "../../i18n/routes";
	import { mainNav } from "../../config/nav.config";
	import { siteConfig } from "../../config/site.config";
	import Logo from "./Logo.svelte";
	import LanguageSwitcher from "./LanguageSwitcher.svelte";

	interface Props {
		currentLocale: Locale;
		currentPath?: string;
		/** Rendered between the language switcher and the mobile menu button. */
		themeToggle?: Snippet;
	}

	const { currentLocale, currentPath = "/", themeToggle }: Props = $props();

	const effectiveLocale = $derived(
		detectLocale(currentPath) || currentLocale,
	);
	const contentPath = $derived(stripLocale(currentPath));

	const navLinks = $derived(
		mainNav.map((item) => ({
			...item,
			href: resolveRoute(effectiveLocale, item.href),
			active: contentPath === item.href,
		})),
	);

	const githubUrl = siteConfig.socialLinks.find(
		(link) => link.platform === "github",
	)?.url;

	let menuOpen = $state(false);
	let scrollDir = $state<"up" | "down">("up");

	$effect(() => {
		let lastScrollY = window.scrollY;
		const updateScrollState = () => {
			const currentY = window.scrollY;
			scrollDir = currentY > lastScrollY && currentY > 80 ? "down" : "up";
			lastScrollY = currentY;
		};
		window.addEventListener("scroll", updateScrollState, { passive: true });
		updateScrollState();
		return () => window.removeEventListener("scroll", updateScrollState);
	});

	$effect(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") menuOpen = false;
		};
		document.addEventListener("keydown", onKeydown);
		return () => document.removeEventListener("keydown", onKeydown);
	});
</script>

<header class="header" data-scrolled={scrollDir}>
	<div class="header__bar container">
		<Logo href={resolveRoute(effectiveLocale, "/")} />

		<nav
			class="header__desktop-nav"
			aria-label={t(effectiveLocale, "nav.home")}
		>
			<ul class="header__list">
				{#each navLinks as item (item.href)}
					<li
						class={`header__item ${item.children?.length ? "header__item--group" : ""}`}
					>
						{#if item.children?.length}
							<div class="header__dropdown">
								<a
									href={item.href}
									aria-current={item.active ? "page" : undefined}
								>
									{t(effectiveLocale, item.labelKey)}
								</a>
								<div class="header__dropdown-panel">
									{#each item.children as child (child.href)}
										<a href={resolveRoute(effectiveLocale, child.href)}>
											{t(effectiveLocale, child.labelKey)}
										</a>
									{/each}
								</div>
							</div>
						{:else}
							<a
								href={item.href}
								aria-current={item.active ? "page" : undefined}
							>
								{t(effectiveLocale, item.labelKey)}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="header__actions">
			{#if githubUrl}
				<a
					href={githubUrl}
					class="header__icon-button header__github"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View source on GitHub"
				>
					<svg
						class="header__icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path
							d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.3-.4-4.1 1.6a11.4 11.4 0 0 0-6 0C6.5 3.5 5.2 3.9 5.2 3.9a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.8 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"
						/>
					</svg>
				</a>
			{/if}
			<button
				type="button"
				class="header__icon-button header__search"
				data-search-trigger
				aria-label={t(effectiveLocale, "aria.searchButton")}
			>
				<svg
					class="header__icon"
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
				<kbd class="header__kbd">⌘K</kbd>
			</button>
			<LanguageSwitcher
				currentLocale={effectiveLocale}
				currentPath={currentPath}
			/>
			{@render themeToggle?.()}
			<button
				type="button"
				class="header__icon-button header__menu-button"
				aria-controls="header-mobile-menu"
				aria-expanded={menuOpen}
				aria-label={t(effectiveLocale, "nav.toggleMenu")}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg
					class="header__icon header__icon--menu"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M4 12h16" />
					<path d="M4 18h16" />
					<path d="M4 6h16" />
				</svg>
				<svg
					class="header__icon header__icon--close"
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
	</div>

	<div id="header-mobile-menu" class="header__mobile" hidden={!menuOpen}>
		<nav aria-label={t(effectiveLocale, "nav.home")}>
			<ul class="header__mobile-list">
				{#each navLinks as item (item.href)}
					<li>
						<a href={item.href} aria-current={item.active ? "page" : undefined}>
							{t(effectiveLocale, item.labelKey)}
						</a>
						{#if item.children?.length}
							<ul class="header__mobile-sublist">
								{#each item.children as child (child.href)}
									<li>
										<a href={resolveRoute(effectiveLocale, child.href)}>
											{t(effectiveLocale, child.labelKey)}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		border-bottom: 1px solid var(--color-border);
		background: color-mix(in oklab, var(--color-bg-primary) 92%, transparent);
		backdrop-filter: blur(14px);
		transition: transform 0.2s ease;
	}

	.header[data-scrolled="down"] {
		transform: translateY(-100%);
	}

	.header__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
		min-height: 4.25rem;
	}

	.header__desktop-nav {
		flex: 1;
	}

	.header__list {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.header__item > a,
	.header__dropdown > a {
		display: inline-flex;
		align-items: center;
		padding: 0.4rem 0.65rem;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-weight: 600;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.header__item > a:hover,
	.header__dropdown > a:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-tertiary);
	}

	.header__item > a:focus-visible,
	.header__dropdown > a:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.header__item > a:active,
	.header__dropdown > a:active {
		color: var(--color-brand-primary);
	}

	.header__item > a[aria-current="page"],
	.header__dropdown > a[aria-current="page"] {
		color: var(--color-brand-primary);
	}

	.header__dropdown {
		position: relative;
	}

	.header__dropdown-panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		min-width: 12rem;
		display: none;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-bg-primary);
		padding: 0.75rem;
		box-shadow: var(--shadow-md);
	}

	.header__dropdown:hover .header__dropdown-panel,
	.header__dropdown:focus-within .header__dropdown-panel {
		display: flex;
	}

	.header__dropdown-panel a {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.9375rem;
	}

	.header__dropdown-panel a:hover {
		color: var(--color-brand-primary);
	}

	.header__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header__icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: 2.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		padding: 0 0.7rem;
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.header__search {
		padding-inline: 0.75rem;
	}

	.header__github {
		width: 2.5rem;
		padding-inline: 0;
	}

	.header__icon {
		width: 1.05rem;
		height: 1.05rem;
	}

	.header__kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1;
		padding: 0.2rem 0.35rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	.header__icon-button:hover {
		border-color: var(--color-brand-primary);
		color: var(--color-brand-primary);
		background: var(--color-bg-secondary);
		transform: scale(1.05);
	}

	.header__icon-button:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.header__icon-button:active {
		transform: scale(0.95);
	}

	.header__menu-button {
		display: none;
		width: 2.5rem;
		height: 2.5rem;
		padding-inline: 0;
	}

	.header__icon--close {
		display: none;
	}

	.header__menu-button[aria-expanded="true"] .header__icon--menu {
		display: none;
	}

	.header__menu-button[aria-expanded="true"] .header__icon--close {
		display: inline-block;
	}

	/* Hide the keyboard hint where horizontal space is tight. */
	@media (max-width: 30rem) {
		.header__kbd {
			display: none;
		}
	}

	.header__mobile {
		display: none;
		padding-inline: var(--section-px);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-primary);
	}

	.header__mobile-list,
	.header__mobile-sublist {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.header__mobile-list {
		display: grid;
		gap: 0.25rem;
		padding: var(--space-md) 0;
	}

	.header__mobile-list a {
		display: block;
		padding: 0.6rem 0.5rem;
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		text-decoration: none;
		font-weight: 600;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.header__mobile-list a:hover {
		background: var(--color-bg-tertiary);
	}

	.header__mobile-list a:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.header__mobile-list a[aria-current="page"] {
		color: var(--color-brand-primary);
	}

	.header__mobile-sublist {
		padding-left: 1rem;
		margin-top: 0.5rem;
		display: grid;
		gap: 0.35rem;
	}

	@media (max-width: 60rem) {
		.header__desktop-nav {
			display: none;
		}

		.header__menu-button {
			display: inline-flex;
		}

		.header__mobile:not([hidden]) {
			display: block;
		}
	}
</style>
