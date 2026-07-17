<script lang="ts">
	import { onMount } from "svelte";
	import AdminAnalytics from "./AdminAnalytics.svelte";
	import ContentEditor from "./ContentEditor.svelte";
	import { clearDemoAccount, readDemoAccount } from "../../lib/demo-account";
	import ThemeToggle from "../layout/ThemeToggle.svelte";
	import type { Locale } from "../../lib/site-config";
	import {
		DEFAULT_FILTERS,
		MARKETS,
		employeeSales,
		filterAdminRows,
		formatPct,
		formatUsd,
		loadAdminAnalytics,
		summarizeRows,
		type AdminAnalyticsRow,
		type AdminAnalyticsTotals,
	} from "../../lib/admin-analytics";

	export interface InventoryItem {
		href: string;
		label: string;
		count: number;
	}

	export interface WalkLink {
		href: string;
		label: string;
		hint: string;
	}

	export interface WalkGroup {
		title: string;
		links: readonly WalkLink[];
	}

	type Panel = "overview" | "analytics" | "content" | "site";

	interface Props {
		inventory: InventoryItem[];
		walkthrough: WalkGroup[];
		locale?: Locale;
	}

	const { inventory, walkthrough, locale = "en" }: Props = $props();

	const nav: { id: Panel; label: string }[] = [
		{ id: "overview", label: "Overview" },
		{ id: "analytics", label: "Analytics" },
		{ id: "content", label: "Content" },
		{ id: "site", label: "Site tools" },
	];

	let panel = $state<Panel>("overview");
	let navOpen = $state(false);
	let name = $state("Demo Admin");
	let email = $state("admin@osead.demo");
	let sessionAt = $state("");
	let overviewKpis = $state<AdminAnalyticsTotals | null>(null);
	// ponytail: stashed once here so G2 (staff pulse) can reuse without a second fetch.
	let overviewRows = $state<AdminAnalyticsRow[]>([]);

	const leadingMarket = $derived.by(() => {
		let best: { market: string; totals: AdminAnalyticsTotals } | null = null;
		for (const market of MARKETS) {
			const totals = summarizeRows(
				overviewRows.filter((row) => row.market === market),
			);
			const score = totals.salesVolume + totals.rentalRevenue;
			const bestScore = best ? best.totals.salesVolume + best.totals.rentalRevenue : -1;
			if (score > bestScore) best = { market, totals };
		}
		return best;
	});

	// ponytail: G2 reuses G1's stashed overviewRows, no second loadAdminAnalytics() call.
	const topStaff = $derived(employeeSales(overviewRows).slice(0, 3));

	const panelTitle = $derived(
		nav.find((item) => item.id === panel)?.label ?? "Overview",
	);

	function setPanel(next: Panel) {
		panel = next;
		navOpen = false;
		const hash = next === "overview" ? "" : `#${next}`;
		history.replaceState(null, "", `${location.pathname}${hash}`);
	}

	function signOut() {
		clearDemoAccount();
		window.location.assign("/login");
	}

	async function loadOverviewKpis() {
		try {
			const payload = await loadAdminAnalytics();
			overviewRows = filterAdminRows(payload.rows, DEFAULT_FILTERS);
			overviewKpis = summarizeRows(overviewRows);
		} catch {
			// Inventory tiles already render; the KPI strip is a bonus, not a blocker.
		}
	}

	onMount(() => {
		const account = readDemoAccount();
		if (account) {
			name = account.name;
			email = account.email;
			sessionAt = new Date(account.at).toLocaleString();
		}
		const raw = location.hash.replace(/^#/, "");
		if (raw === "analytics" || raw === "content" || raw === "site") {
			panel = raw;
		}
		if (panel === "overview") {
			void loadOverviewKpis();
		}
	});
</script>

<div class="admin-shell" data-nav-open={navOpen}>
		<aside class="admin-shell__sidebar" id="admin-sidebar" aria-label="Admin">
		<div class="admin-shell__brand">
			<a href="/" class="admin-shell__logo">O-sea-D</a>
			<span class="admin-shell__badge">Admin</span>
		</div>

		<nav class="admin-shell__nav">
			<p class="admin-shell__nav-label">Workspace</p>
			<ul>
				{#each nav as item (item.id)}
					<li>
						<button
							type="button"
							class="admin-shell__nav-btn"
							class:is-active={panel === item.id}
							aria-current={panel === item.id ? "page" : undefined}
							onclick={() => setPanel(item.id)}
						>
							{item.label}
						</button>
					</li>
				{/each}
			</ul>

			<p class="admin-shell__nav-label">Shortcuts</p>
			<ul class="admin-shell__shortcuts">
				<li><a href="/rentals">Rentals</a></li>
				<li><a href="/sales">Sales</a></li>
				<li><a href="/blog">Journal</a></li>
				<li><a href="/contact">Contact</a></li>
			</ul>
		</nav>

		<div class="admin-shell__sidebar-foot">
			<a href="/">View site</a>
			<button type="button" onclick={signOut}>Sign out</button>
		</div>
	</aside>

	<div class="admin-shell__main">
		<header class="admin-shell__top">
			<button
				type="button"
				class="admin-shell__menu"
				aria-expanded={navOpen}
				aria-controls="admin-sidebar"
				onclick={() => (navOpen = !navOpen)}
			>
				Menu
			</button>
			<div class="admin-shell__top-copy">
				<p class="admin-shell__eyebrow">Demo account</p>
				<h1>{panelTitle}</h1>
			</div>
			<div class="admin-shell__top-meta">
				<div class="admin-shell__who">
					<strong>{name}</strong>
					<span>{email}</span>
				</div>
				<ThemeToggle {locale} />
			</div>
		</header>

		<div class="admin-shell__canvas">
			{#if panel === "overview"}
				<section class="admin-panel" aria-labelledby="overview-title">
					<header class="admin-panel__head">
						<div>
							<h2 id="overview-title">Inventory at a glance</h2>
							<p>
								Session started {sessionAt}. Content lives in
								<code>src/content/</code> — edit Markdown, refresh.
							</p>
						</div>
						<p class="admin-panel__creds">
							<code>admin@osead.demo</code>
							/
							<code>osead-admin</code>
						</p>
					</header>

					<div class="admin-panel__stats" aria-label="Content inventory">
						{#each inventory as item (item.href)}
							<a class="admin-panel__stat" href={item.href}>
								<span class="admin-panel__stat-count">{item.count}</span>
								<span class="admin-panel__stat-label">{item.label}</span>
							</a>
						{/each}
					</div>

					{#if overviewKpis}
						<div
							class="admin-panel__stats"
							aria-label="Key performance indicators"
						>
							<div class="admin-panel__stat">
								<span class="admin-panel__stat-count"
									>{formatUsd(overviewKpis.salesVolume)}</span
								>
								<span class="admin-panel__stat-label">Sales volume</span>
							</div>
							<div class="admin-panel__stat">
								<span class="admin-panel__stat-count"
									>{formatPct(overviewKpis.occupancyRate)}</span
								>
								<span class="admin-panel__stat-label">Occupancy</span>
							</div>
							<div class="admin-panel__stat">
								<span class="admin-panel__stat-count"
									>{formatUsd(overviewKpis.rentalRevenue)}</span
								>
								<span class="admin-panel__stat-label">Rental revenue</span>
							</div>
							<div class="admin-panel__stat">
								<span class="admin-panel__stat-count"
									>{overviewKpis.closedDeals}</span
								>
								<span class="admin-panel__stat-label">Closed deals</span>
							</div>
							<div class="admin-panel__stat">
								<span class="admin-panel__stat-count"
									>{leadingMarket
										? leadingMarket.market.replaceAll("-", " ")
										: "—"}</span
								>
								<span class="admin-panel__stat-label">Leading market</span>
							</div>
						</div>
					{/if}

					{#if topStaff.length > 0}
						<div class="admin-panel__staff" aria-label="Top staff by sales">
							<div class="admin-panel__staff-head">
								<h3>Staff pulse</h3>
								<button
									type="button"
									class="admin-panel__staff-link"
									onclick={() => setPanel("analytics")}
								>
									View analytics →
								</button>
							</div>
							<ul class="admin-panel__staff-list">
								{#each topStaff as staff (staff.employeeId)}
									<li>
										<span class="admin-panel__staff-name">{staff.name}</span>
										<span class="admin-panel__staff-value"
											>{formatUsd(staff.salesVolume)}</span
										>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="admin-panel__quick">
						<button type="button" onclick={() => setPanel("analytics")}
							>Open analytics</button
						>
						<button type="button" onclick={() => setPanel("content")}
							>Edit Markdown</button
						>
						<button type="button" onclick={() => setPanel("site")}
							>Site walkthrough</button
						>
					</div>
				</section>
			{:else if panel === "analytics"}
				<div class="admin-panel admin-panel--flush">
					<AdminAnalytics />
				</div>
			{:else if panel === "content"}
				<div class="admin-panel admin-panel--flush">
					<ContentEditor />
				</div>
			{:else}
				<section class="admin-panel" aria-labelledby="site-title">
					<header class="admin-panel__head">
						<div>
							<h2 id="site-title">Site walkthrough</h2>
							<p>Jump into public surfaces for local click-through testing.</p>
						</div>
					</header>
					<div class="admin-panel__groups">
						{#each walkthrough as group (group.title)}
							<section>
								<h3>{group.title}</h3>
								<ul>
									{#each group.links as link (link.href)}
										<li>
											<a href={link.href}>
												<span>{link.label}</span>
												<small>{link.hint}</small>
											</a>
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</div>

	{#if navOpen}
		<button
			type="button"
			class="admin-shell__backdrop"
			aria-label="Close menu"
			onclick={() => (navOpen = false)}
		></button>
	{/if}
</div>

<style>
	.admin-shell {
		display: grid;
		grid-template-columns: 15.5rem minmax(0, 1fr);
		min-height: 100vh;
		background: var(--background);
		color: var(--foreground);
	}

	.admin-shell__sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.1rem 0.9rem;
		border-right: 1px solid var(--border);
		background: color-mix(in oklab, var(--muted) 35%, var(--background));
	}

	.admin-shell__brand {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 0.35rem;
	}

	.admin-shell__logo {
		font-weight: 800;
		font-size: 1.05rem;
		letter-spacing: var(--tracking-tight, -0.02em);
		color: inherit;
		text-decoration: none;
	}

	.admin-shell__badge {
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--border);
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.admin-shell__nav-label {
		margin: 0.85rem 0 0.35rem;
		padding-inline: 0.45rem;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-shell__nav ul,
	.admin-shell__shortcuts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}

	.admin-shell__nav-btn,
	.admin-shell__shortcuts a {
		display: block;
		width: 100%;
		padding: 0.5rem 0.55rem;
		border: 0;
		border-radius: var(--radius-md, 0.4rem);
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}

	.admin-shell__nav-btn:hover,
	.admin-shell__shortcuts a:hover,
	.admin-shell__nav-btn.is-active {
		background: color-mix(in oklab, var(--foreground) 8%, transparent);
		color: var(--foreground);
	}

	.admin-shell__sidebar-foot {
		margin-top: auto;
		display: grid;
		gap: 0.35rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.admin-shell__sidebar-foot a,
	.admin-shell__sidebar-foot button {
		padding: 0.45rem 0.55rem;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}

	.admin-shell__sidebar-foot a:hover,
	.admin-shell__sidebar-foot button:hover {
		color: var(--foreground);
	}

	.admin-shell__main {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-width: 0;
		min-height: 100vh;
	}

	.admin-shell__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem 1.25rem;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--background);
	}

	.admin-shell__menu {
		display: none;
		padding: 0.4rem 0.65rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}

	.admin-shell__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-shell__top h1 {
		margin: 0.15rem 0 0;
		font-size: 1.25rem;
		line-height: 1.2;
	}

	.admin-shell__top-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.admin-shell__who {
		display: grid;
		justify-items: end;
		gap: 0.1rem;
		font-size: var(--text-sm);
	}

	.admin-shell__who strong {
		font-weight: 700;
	}

	.admin-shell__who span {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
	}

	.admin-shell__canvas {
		padding: 1.1rem 1.25rem 1.25rem;
		overflow: auto;
	}

	.admin-panel {
		display: grid;
		gap: 0.9rem;
		align-content: start;
	}

	.admin-panel--flush :global(.admin-analytics),
	.admin-panel--flush :global(.content-editor) {
		border: 0;
		padding: 0;
	}

	.admin-panel__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.85rem;
		align-items: flex-start;
	}

	.admin-panel__head h2 {
		margin: 0;
		font-size: 1.15rem;
	}

	.admin-panel__head p {
		margin: 0.35rem 0 0;
		max-width: 48ch;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.45;
	}

	.admin-panel__creds {
		margin: 0;
		padding: 0.45rem 0.65rem;
		border: 1px dashed var(--border);
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.admin-panel__creds code {
		color: var(--foreground);
	}

	.admin-panel__stats {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 1px;
		border: 1px solid var(--border);
		background: var(--border);
	}

	.admin-panel__stat {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.85rem 0.85rem;
		background: var(--background);
		color: inherit;
		text-decoration: none;
	}

	.admin-panel__stat:hover {
		background: color-mix(in oklab, var(--foreground) 6%, var(--background));
	}

	.admin-panel__stat-count {
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.admin-panel__stat-label {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-panel__staff {
		display: grid;
		gap: 0.5rem;
		padding: 0.75rem 0.85rem;
		border: 1px solid var(--border);
	}

	.admin-panel__staff-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.admin-panel__staff-head h3 {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-panel__staff-link {
		border: 0;
		background: transparent;
		padding: 0;
		color: var(--muted-foreground);
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 700;
		cursor: pointer;
	}

	.admin-panel__staff-link:hover {
		color: var(--foreground);
	}

	.admin-panel__staff-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.3rem;
	}

	.admin-panel__staff-list li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: var(--text-sm);
	}

	.admin-panel__staff-name {
		font-weight: 600;
	}

	.admin-panel__staff-value {
		font-variant-numeric: tabular-nums;
		color: var(--muted-foreground);
	}

	.admin-panel__quick {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.admin-panel__quick button {
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 700;
		cursor: pointer;
	}

	.admin-panel__quick button:hover {
		border-color: var(--foreground);
	}

	.admin-panel__groups {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.admin-panel__groups h3 {
		margin: 0 0 0.5rem;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.admin-panel__groups ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}

	.admin-panel__groups a {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.55rem 0.65rem;
		border: 1px solid var(--border);
		color: inherit;
		text-decoration: none;
	}

	.admin-panel__groups a:hover {
		border-color: var(--foreground);
	}

	.admin-panel__groups span {
		font-weight: 700;
		font-size: var(--text-sm);
	}

	.admin-panel__groups small {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
	}

	.admin-shell__backdrop {
		display: none;
	}

	@media (max-width: 64rem) {
		.admin-panel__stats {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.admin-panel__groups {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 52rem) {
		.admin-shell {
			grid-template-columns: 1fr;
		}

		.admin-shell__sidebar {
			position: fixed;
			inset: 0 auto 0 0;
			z-index: 40;
			width: min(18rem, 86vw);
			transform: translateX(-105%);
			transition: transform 0.18s ease;
		}

		.admin-shell[data-nav-open="true"] .admin-shell__sidebar {
			transform: none;
		}

		.admin-shell__menu {
			display: inline-flex;
		}

		.admin-shell__backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 30;
			border: 0;
			background: color-mix(in oklab, var(--foreground) 35%, transparent);
			cursor: pointer;
		}

		.admin-shell__who {
			display: none;
		}

		.admin-panel__groups {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 30rem) {
		.admin-panel__stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.admin-shell__canvas {
			padding-inline: 0.85rem;
		}
	}

</style>
