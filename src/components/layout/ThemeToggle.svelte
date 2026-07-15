<script lang="ts">
	import type { Locale } from "../../lib/site-config";
	import { t } from "../../i18n/ui";

	interface Props {
		locale?: Locale;
	}

	const { locale = "en" }: Props = $props();
	const labelDark = $derived(t(locale, "nav.darkMode"));
	const labelLight = $derived(t(locale, "nav.lightMode"));

	// Keep the main site and the Starlight /docs section in sync by mirroring
	// the choice into both storage keys.
	const storageKey = "theme";
	const starlightKey = "starlight-theme";

	// The `dark` class is applied before hydration by BaseLayout's inline
	// bootstrap script, so this only needs to mirror that decision, not
	// recompute it (avoids a second, possibly conflicting, preference read).
	let isDark = $state(false);

	$effect(() => {
		isDark = document.documentElement.classList.contains("dark");
	});

	function toggleTheme() {
		const next = !isDark;
		document.documentElement.classList.toggle("dark", next);
		try {
			localStorage.setItem(storageKey, next ? "dark" : "light");
			localStorage.setItem(starlightKey, next ? "dark" : "light");
		} catch {
			// Ignore storage failures and preserve the toggled theme in-memory.
		}
		isDark = next;
	}
</script>

<button
	type="button"
	class="theme-toggle"
	aria-label={isDark ? labelLight : labelDark}
	aria-pressed={isDark}
	data-theme={isDark ? "dark" : "light"}
	onclick={toggleTheme}
>
	<svg
		class="theme-toggle__icon theme-toggle__icon--light"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2" />
		<path d="M12 20v2" />
		<path d="m4.93 4.93 1.41 1.41" />
		<path d="m17.66 17.66 1.41 1.41" />
		<path d="M2 12h2" />
		<path d="M20 12h2" />
		<path d="m6.34 17.66-1.41 1.41" />
		<path d="m19.07 4.93-1.41 1.41" />
	</svg>
	<svg
		class="theme-toggle__icon theme-toggle__icon--dark"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
	<span class="theme-toggle__label">{isDark ? labelLight : labelDark}</span>
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.theme-toggle:hover {
		border-color: var(--color-brand-primary);
		color: var(--color-brand-primary);
		background: var(--color-bg-secondary);
		transform: scale(1.05);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle__icon {
		width: 1.15rem;
		height: 1.15rem;
		transition: transform 0.3s ease;
	}

	.theme-toggle__icon--dark {
		display: none;
	}

	.theme-toggle[data-theme="dark"] .theme-toggle__icon--light {
		display: none;
	}

	.theme-toggle[data-theme="dark"] .theme-toggle__icon--dark {
		display: inline-block;
	}

	.theme-toggle[data-theme="light"] .theme-toggle__icon--light {
		display: inline-block;
	}

	.theme-toggle__label {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
