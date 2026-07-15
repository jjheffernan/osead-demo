<script lang="ts">
	import { siteConfig } from "../../config/site.config";
	import { footerNav } from "../../config/nav.config";
	import { buyMarketplaces, rentMarketplaces } from "../../config/marketplaces";
	import { t } from "../../i18n/ui";
	import { resolveRoute } from "../../i18n/routes";
	import type { Locale } from "../../lib/site-config";
	import ListingNotice from "../properties/ListingNotice.svelte";
	import Logo from "./Logo.svelte";

	interface Props {
		currentLocale: Locale;
	}

	const { currentLocale }: Props = $props();
	const year = new Date().getFullYear();

	// astro-icon stays Astro-only, so social icons are inlined here (lucide-style paths)
	// as an if/else chain of literal markup — avoids {@html} entirely.
	type SocialIconKind = "github" | "twitter" | "linkedin" | "mail" | "link";

	function socialIconKind(url: string): SocialIconKind {
		if (url.includes("github.com")) return "github";
		if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
		if (url.includes("linkedin.com")) return "linkedin";
		if (url.startsWith("mailto:")) return "mail";
		return "link";
	}
</script>

<footer class="footer">
	<div class="footer__inner container">
		<div class="footer__grid">
			<div class="footer__brand">
				<Logo />
				<p>{siteConfig.description}</p>
			</div>

			<div class="footer__column">
				<h2>Explore</h2>
				<ul>
					{#each footerNav.product as item (item.href)}
						<li>
							<a href={resolveRoute(currentLocale, item.href)}>
								{t(currentLocale, item.labelKey)}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="footer__column">
				<h2>Company</h2>
				<ul>
					{#each footerNav.company as item (item.href)}
						<li>
							<a href={resolveRoute(currentLocale, item.href)}>
								{t(currentLocale, item.labelKey)}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="footer__column">
				<h2>Buy online</h2>
				<ul>
					{#each buyMarketplaces as link (link.href)}
						<li>
							<a href={link.href} target="_blank" rel="noopener noreferrer">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="footer__column">
				<h2>Rent online</h2>
				<ul>
					{#each rentMarketplaces as link (link.href)}
						<li>
							<a href={link.href} target="_blank" rel="noopener noreferrer">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			{#if siteConfig.header.showSocialLinks}
				<div class="footer__column">
					<h2>Connect</h2>
					<ul class="footer__social">
						{#each siteConfig.socialLinks as link (link.url)}
							<li>
								<a
									href={link.url}
									target={link.url.startsWith("http") ? "_blank" : undefined}
									rel="noreferrer"
								>
									<svg
										class="footer__social-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										{#if socialIconKind(link.url) === "github"}
											<path
												d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.3-.4-4.1 1.6a11.4 11.4 0 0 0-6 0C6.5 3.5 5.2 3.9 5.2 3.9a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.8 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"
											/>
										{:else if socialIconKind(link.url) === "twitter"}
											<path
												d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
											/>
										{:else if socialIconKind(link.url) === "linkedin"}
											<path
												d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
											/>
											<rect width="4" height="12" x="2" y="9" />
											<circle cx="4" cy="4" r="2" />
										{:else if socialIconKind(link.url) === "mail"}
											<rect width="20" height="16" x="2" y="4" rx="2" />
											<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
										{:else}
											<path
												d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
											/>
											<path
												d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
											/>
										{/if}
									</svg>
									<span>{link.label ?? link.platform}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<ListingNotice />

		<div class="footer__meta">
			<p>&copy; {year} {siteConfig.name}</p>
			<div class="footer__legal">
				{#each footerNav.legal as item (item.href)}
					<a href={resolveRoute(currentLocale, item.href)}>
						{t(currentLocale, item.labelKey)}
					</a>
				{/each}
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: auto;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}

	.footer__inner {
		padding-block: var(--space-xl) var(--space-md);
	}

	.footer__grid {
		display: grid;
		gap: var(--space-lg) var(--space-md);
		grid-template-columns: 1.4fr repeat(5, minmax(0, 1fr));
	}

	.footer__brand p {
		margin: var(--space-sm) 0 0;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.footer__column h2 {
		margin: 0 0 0.55rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.footer__column ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}

	.footer__column a {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		text-decoration: none;
	}

	.footer__column a:hover,
	.footer__social a:hover {
		color: var(--color-brand-primary);
	}

	.footer__social a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.footer__social-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.footer__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 0.85rem;
	}

	.footer__legal {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.footer__legal a {
		color: inherit;
		text-decoration: none;
	}

	@media (max-width: 70rem) {
		.footer__grid {
			grid-template-columns: 1fr 1fr 1fr;
		}

		.footer__brand {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 40rem) {
		.footer__grid,
		.footer__meta {
			grid-template-columns: 1fr 1fr;
			display: grid;
		}

		.footer__brand {
			grid-column: 1 / -1;
		}
	}
</style>
