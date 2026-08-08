<script lang="ts">
	import { onMount } from "svelte";
	import {
		canEditContent,
		canEditOwnPosts,
		canEditOwnProfile,
		canViewAnalytics,
		clearDemoAccount,
		readDemoAccount,
		type DemoRole,
	} from "../../lib/demo-account";
	import { demoStaff } from "../../config/staff";
	import { assignmentsForAgent } from "../../config/agent-assignments";
	import ThemeToggle from "../layout/ThemeToggle.svelte";
	import type { Locale } from "../../lib/site-config";
	import {
		DEFAULT_FILTERS,
		employeeSales,
		filterAdminRows,
		formatUsd,
		loadAdminAnalytics,
		type EmployeeSalesRow,
	} from "../../lib/admin-analytics";

	export interface AgentInventoryProperty {
		slug: string;
		title: string;
		href: string;
		market: string;
		listingType: "rental" | "sale" | "both";
		agentId?: string;
		attribution?: "attributed" | "anonymous";
	}

	export interface AgentPost {
		slug: string;
		title: string;
		href: string;
		authorId?: string;
	}

	const PROFILE_KEY = "osead-agent-profile";

	interface Props {
		properties: AgentInventoryProperty[];
		posts?: AgentPost[];
		locale?: Locale;
	}

	const { properties, posts = [], locale = "en" }: Props = $props();

	type Panel = "inbox" | "inventory" | "posts" | "profile";
	const nav: { id: Panel; label: string }[] = [
		{ id: "inbox", label: "Inbox" },
		{ id: "inventory", label: "My inventory" },
		{ id: "posts", label: "My posts" },
		{ id: "profile", label: "Profile" },
	];

	let panel = $state<Panel>("inbox");
	let navOpen = $state(false);
	let name = $state("Demo Agent");
	let email = $state("agent@osead.demo");
	let sessionAt = $state("");
	let role = $state<DemoRole>("agent");
	let pulseRows = $state<EmployeeSalesRow[]>([]);
	let profileName = $state("");
	let profileRole = $state("");
	let profileBio = $state("");
	let profileSaved = $state("");

	// DEMO_AGENT has no demoStaff row (locked "no name->staff mapping" decision) —
	// inbox/inventory/profile/pulse all key off the sample demoStaff[0] agent.
	const staffId = demoStaff[0]?.id ?? "";
	const seedProfile = demoStaff.find((staff) => staff.id === staffId);
	const { market, inquiries } = assignmentsForAgent(staffId);

	function findProperty(slug: string): AgentInventoryProperty | undefined {
		return properties.find((property) => property.slug === slug);
	}

	function intentLabel(intent: string): string {
		if (intent === "booking-inquiry") return "Booking inquiry";
		if (intent === "rent") return "Rental";
		if (intent === "sale") return "Sale";
		return intent;
	}

	const inboxRows = $derived(
		[...inquiries]
			.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
			.map((inquiry) => ({
				inquiry,
				property: findProperty(inquiry.propertySlug),
			})),
	);

	const myAttached = $derived(
		properties.filter(
			(property) =>
				property.agentId === staffId && property.attribution !== "anonymous",
		),
	);

	const myInventory = $derived(
		properties.filter((property) => property.market === market),
	);

	const myPosts = $derived(
		posts.filter((post) => post.authorId === staffId),
	);

	const panelTitle = $derived(
		nav.find((item) => item.id === panel)?.label ?? "Inbox",
	);

	function loadProfileOverride() {
		const seed = seedProfile;
		profileName = seed?.name ?? name;
		profileRole = seed?.role ?? "Agent";
		profileBio = seed?.bio ?? "";
		if (typeof localStorage === "undefined") return;
		try {
			const raw = localStorage.getItem(`${PROFILE_KEY}:${email}`);
			if (!raw) return;
			const parsed = JSON.parse(raw) as {
				name?: string;
				role?: string;
				bio?: string;
			};
			if (parsed.name) profileName = parsed.name;
			if (parsed.role) profileRole = parsed.role;
			if (typeof parsed.bio === "string") profileBio = parsed.bio;
		} catch {
			/* keep seed */
		}
	}

	function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		if (!canEditOwnProfile(role)) return;
		localStorage.setItem(
			`${PROFILE_KEY}:${email}`,
			JSON.stringify({
				name: profileName.trim(),
				role: profileRole.trim(),
				bio: profileBio.trim(),
			}),
		);
		profileSaved = "Profile saved for this browser (demo).";
	}

	function setPanel(next: Panel) {
		panel = next;
		navOpen = false;
		const hash = next === "inbox" ? "" : `#${next}`;
		history.replaceState(null, "", `${location.pathname}${hash}`);
	}

	function signOut() {
		clearDemoAccount();
		window.location.assign("/login");
	}

	async function loadPulse() {
		try {
			const payload = await loadAdminAnalytics();
			const rows = filterAdminRows(payload.rows, DEFAULT_FILTERS);
			pulseRows = employeeSales(rows).slice(0, 3);
		} catch {
			// Pulse is a bonus strip — inbox/inventory/profile already render without it.
		}
	}

	onMount(() => {
		const account = readDemoAccount();
		if (account) {
			name = account.name;
			email = account.email;
			role = account.role;
			sessionAt = new Date(account.at).toLocaleString();
		}
		const raw = location.hash.replace(/^#/, "");
		// Defense-in-depth: an admin-only deep link (#content/#analytics) can't
		// resolve to anything here even without this check (Panel has no such
		// member), but the capability gate keeps parity with AdminShell's rule.
		const blocked =
			(raw === "content" && !canEditContent(role)) ||
			(raw === "analytics" && !canViewAnalytics(role));
		if (!blocked && (raw === "inventory" || raw === "posts" || raw === "profile")) {
			panel = raw;
		}
		loadProfileOverride();
		void loadPulse();
	});
</script>

<div class="agent-desk" data-nav-open={navOpen}>
	<aside class="agent-desk__sidebar" id="agent-sidebar" aria-label="Agent">
		<div class="agent-desk__brand">
			<a href="/" class="agent-desk__logo">O-sea-D</a>
			<span class="agent-desk__badge">Agent</span>
		</div>

		<nav class="agent-desk__nav">
			<p class="agent-desk__nav-label">Workspace</p>
			<ul>
				{#each nav as item (item.id)}
					<li>
						<button
							type="button"
							class="agent-desk__nav-btn"
							class:is-active={panel === item.id}
							aria-current={panel === item.id ? "page" : undefined}
							onclick={() => setPanel(item.id)}
						>
							{item.label}
						</button>
					</li>
				{/each}
			</ul>

			<p class="agent-desk__nav-label">Shortcuts</p>
			<ul class="agent-desk__shortcuts">
				<li><a href="/rentals">Rentals</a></li>
				<li><a href="/sales">Sales</a></li>
				<li><a href="/contact">Contact</a></li>
			</ul>
		</nav>

		<div class="agent-desk__sidebar-foot">
			<a href="/">View site</a>
			<button type="button" onclick={signOut}>Sign out</button>
		</div>
	</aside>

	<div class="agent-desk__main">
		<header class="agent-desk__top">
			<button
				type="button"
				class="agent-desk__menu"
				aria-expanded={navOpen}
				aria-controls="agent-sidebar"
				onclick={() => (navOpen = !navOpen)}
			>
				Menu
			</button>
			<div class="agent-desk__top-copy">
				<p class="agent-desk__eyebrow">Demo account</p>
				<h1>{panelTitle}</h1>
			</div>
			<div class="agent-desk__top-meta">
				<div class="agent-desk__who">
					<strong>{name}</strong>
					<span>{email}</span>
				</div>
				<ThemeToggle {locale} />
			</div>
		</header>

		<div class="agent-desk__canvas">
			{#if panel === "inbox"}
				<section class="agent-panel" aria-labelledby="inbox-title">
					<header class="agent-panel__head">
						<div>
							<h2 id="inbox-title">Assigned inquiries</h2>
							<p>
								Session started {sessionAt}. Assigned via market rotation over
								the sample staff roster — a static demo seam, not live routing.
							</p>
						</div>
						<p class="agent-panel__creds">
							<code>agent@osead.demo</code>
							/
							<code>osead-agent</code>
						</p>
					</header>

					{#if inboxRows.length === 0}
						<p class="agent-panel__empty">
							No assigned inquiries yet. <a href="/contact">Message a lead</a>
							from the site to see it land here.
						</p>
					{:else}
						<ul class="agent-panel__list">
							{#each inboxRows as row (row.inquiry.submittedAt + row.inquiry.propertySlug)}
								<li>
									<div class="agent-panel__list-main">
										{#if row.property}
											<a href={row.property.href}>{row.property.title}</a>
										{:else}
											<span>{row.inquiry.propertySlug}</span>
										{/if}
										<span class="agent-panel__list-intent"
											>{intentLabel(row.inquiry.intent)}</span
										>
									</div>
									{#if row.inquiry.checkIn && row.inquiry.checkOut}
										<span class="agent-panel__list-meta">
											{row.inquiry.checkIn} → {row.inquiry.checkOut}
										</span>
									{/if}
									<span class="agent-panel__list-meta">
										Submitted {new Date(
											row.inquiry.submittedAt,
										).toLocaleDateString()}
									</span>
								</li>
							{/each}
						</ul>
					{/if}

					{#if pulseRows.length > 0}
						<div class="agent-panel__staff" aria-label="Sample assigned pulse">
							<h3>Sample assigned pulse (demo)</h3>
							<ul class="agent-panel__staff-list">
								{#each pulseRows as staff (staff.employeeId)}
									<li>
										<span class="agent-panel__staff-name">{staff.name}</span>
										<span class="agent-panel__staff-value"
											>{formatUsd(staff.salesVolume)}</span
										>
									</li>
								{/each}
							</ul>
						</div>
					{:else}
						<p class="agent-panel__stub">
							Sample assigned pulse (demo) — no seed sales data for this
							period.
						</p>
					{/if}
				</section>
			{:else if panel === "inventory"}
				<section class="agent-panel" aria-labelledby="inventory-title">
					<header class="agent-panel__head">
						<div>
							<h2 id="inventory-title">My inventory</h2>
							<p>
								Attached listings ({myAttached.length}) plus market rotation
								{market ? ` — ${market.replaceAll("-", " ")}` : ""}. Anonymous
								homes stay brand-only.
							</p>
						</div>
					</header>

					<h3 class="agent-panel__subhead">Attached to me</h3>
					{#if myAttached.length === 0}
						<p class="agent-panel__empty">
							No <code>agentId</code> attachments yet for {staffId}.
						</p>
					{:else}
						<ul class="agent-panel__list agent-panel__list--inventory">
							{#each myAttached as property (property.slug)}
								<li>
									<a href={property.href}>{property.title}</a>
									<span class="agent-panel__list-meta"
										>{property.listingType}</span
									>
								</li>
							{/each}
						</ul>
					{/if}

					<h3 class="agent-panel__subhead">Market rotation</h3>
					{#if myInventory.length === 0}
						<p class="agent-panel__empty">No listings in this market yet.</p>
					{:else}
						<ul class="agent-panel__list agent-panel__list--inventory">
							{#each myInventory as property (property.slug)}
								<li>
									<a href={property.href}>{property.title}</a>
									<span class="agent-panel__list-meta"
										>{property.listingType}</span
									>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{:else if panel === "posts"}
				<section class="agent-panel" aria-labelledby="posts-title">
					<header class="agent-panel__head">
						<div>
							<h2 id="posts-title">My posts</h2>
							<p>
								Journal entries with <code>authorId</code> matching your staff
								id{canEditOwnPosts(role) ? "" : ""}.
							</p>
						</div>
					</header>
					{#if myPosts.length === 0}
						<p class="agent-panel__empty">No authored posts linked yet.</p>
					{:else}
						<ul class="agent-panel__list">
							{#each myPosts as post (post.slug)}
								<li>
									<a href={post.href}>{post.title}</a>
									<span class="agent-panel__list-meta">Read-only demo</span>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{:else}
				<section class="agent-panel" aria-labelledby="profile-title">
					<header class="agent-panel__head">
						<div>
							<h2 id="profile-title">Profile</h2>
							<p>Edit display fields for this browser (demo local override).</p>
						</div>
					</header>

					<form class="agent-panel__profile-form" onsubmit={saveProfile}>
						<label>
							Display name
							<input bind:value={profileName} required />
						</label>
						<label>
							Role title
							<input bind:value={profileRole} required />
						</label>
						<label>
							Bio
							<textarea bind:value={profileBio} rows="4"></textarea>
						</label>
						<button type="submit" disabled={!canEditOwnProfile(role)}>Save profile</button>
						<p class="agent-panel__list-meta" role="status">{profileSaved}</p>
					</form>
				</section>
			{/if}
		</div>
	</div>

	{#if navOpen}
		<button
			type="button"
			class="agent-desk__backdrop"
			aria-label="Close menu"
			onclick={() => (navOpen = false)}
		></button>
	{/if}
</div>

<style>
	.agent-desk {
		display: grid;
		grid-template-columns: 15.5rem minmax(0, 1fr);
		min-height: 100vh;
		background: var(--background);
		color: var(--foreground);
	}

	.agent-desk__sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.1rem 0.9rem;
		border-right: 1px solid var(--border);
		background: color-mix(in oklab, var(--muted) 35%, var(--background));
	}

	.agent-desk__brand {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 0.35rem;
	}

	.agent-desk__logo {
		font-weight: 800;
		font-size: 1.05rem;
		letter-spacing: var(--tracking-tight, -0.02em);
		color: inherit;
		text-decoration: none;
	}

	.agent-desk__badge {
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--border);
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.agent-desk__nav-label {
		margin: 0.85rem 0 0.35rem;
		padding-inline: 0.45rem;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.agent-desk__nav ul,
	.agent-desk__shortcuts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}

	.agent-desk__nav-btn,
	.agent-desk__shortcuts a {
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

	.agent-desk__nav-btn:hover,
	.agent-desk__shortcuts a:hover,
	.agent-desk__nav-btn.is-active {
		background: color-mix(in oklab, var(--foreground) 8%, transparent);
		color: var(--foreground);
	}

	.agent-desk__sidebar-foot {
		margin-top: auto;
		display: grid;
		gap: 0.35rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.agent-desk__sidebar-foot a,
	.agent-desk__sidebar-foot button {
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

	.agent-desk__sidebar-foot a:hover,
	.agent-desk__sidebar-foot button:hover {
		color: var(--foreground);
	}

	.agent-desk__main {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-width: 0;
		min-height: 100vh;
	}

	.agent-desk__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem 1.25rem;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--background);
	}

	.agent-desk__menu {
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

	.agent-desk__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.agent-desk__top h1 {
		margin: 0.15rem 0 0;
		font-size: 1.25rem;
		line-height: 1.2;
	}

	.agent-desk__top-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.agent-desk__who {
		display: grid;
		justify-items: end;
		gap: 0.1rem;
		font-size: var(--text-sm);
	}

	.agent-desk__who strong {
		font-weight: 700;
	}

	.agent-desk__who span {
		color: var(--muted-foreground);
		font-size: var(--text-xs);
	}

	.agent-desk__canvas {
		padding: 1.1rem 1.25rem 1.25rem;
		overflow: auto;
	}

	.agent-panel {
		display: grid;
		gap: 0.9rem;
		align-content: start;
	}

	.agent-panel__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.85rem;
		align-items: flex-start;
	}

	.agent-panel__head h2 {
		margin: 0;
		font-size: 1.15rem;
	}

	.agent-panel__head p {
		margin: 0.35rem 0 0;
		max-width: 48ch;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.45;
	}

	.agent-panel__creds {
		margin: 0;
		padding: 0.45rem 0.65rem;
		border: 1px dashed var(--border);
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.agent-panel__creds code {
		color: var(--foreground);
	}

	.agent-panel__empty,
	.agent-panel__stub {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.agent-panel__empty a {
		color: var(--foreground);
		font-weight: 700;
	}

	.agent-panel__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}

	.agent-panel__list > li {
		display: grid;
		gap: 0.15rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.agent-panel__list > li:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}

	.agent-panel__list a {
		font-weight: 700;
		color: inherit;
		text-decoration: none;
	}

	.agent-panel__list a:hover {
		text-decoration: underline;
	}

	.agent-panel__list-main {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.agent-panel__list-intent,
	.agent-panel__list-meta {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.agent-panel__list--inventory > li {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}

	.agent-panel__staff {
		display: grid;
		gap: 0.5rem;
		padding: 0.75rem 0.85rem;
		border: 1px solid var(--border);
	}

	.agent-panel__staff h3 {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.agent-panel__staff-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.3rem;
	}

	.agent-panel__staff-list li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: var(--text-sm);
	}

	.agent-panel__staff-name {
		font-weight: 600;
	}

	.agent-panel__staff-value {
		font-variant-numeric: tabular-nums;
		color: var(--muted-foreground);
	}

	.agent-panel__profile {
		display: grid;
		gap: 0.35rem;
		padding: 0.85rem;
		border: 1px solid var(--border);
	}

	.agent-panel__profile strong {
		font-size: 1.05rem;
	}

	.agent-panel__profile p {
		margin: 0.35rem 0 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.agent-panel__subhead {
		margin: 1rem 0 0.5rem;
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.agent-panel__profile-form {
		display: grid;
		gap: 0.85rem;
		max-width: 28rem;
	}

	.agent-panel__profile-form label {
		display: grid;
		gap: 0.3rem;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.agent-panel__profile-form input,
	.agent-panel__profile-form textarea {
		padding: 0.55rem 0.65rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: inherit;
		font: inherit;
	}

	.agent-panel__profile-form button {
		justify-self: start;
		padding: 0.55rem 1rem;
		border: 1px solid var(--border);
		background: var(--primary);
		color: var(--primary-foreground);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.agent-panel__profile-form button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.agent-desk__backdrop {
		display: none;
	}

	@media (max-width: 52rem) {
		.agent-desk {
			grid-template-columns: 1fr;
		}

		.agent-desk__sidebar {
			position: fixed;
			inset: 0 auto 0 0;
			z-index: 40;
			width: min(18rem, 86vw);
			transform: translateX(-105%);
			transition: transform 0.18s ease;
		}

		.agent-desk[data-nav-open="true"] .agent-desk__sidebar {
			transform: none;
		}

		.agent-desk__menu {
			display: inline-flex;
		}

		.agent-desk__backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 30;
			border: 0;
			background: color-mix(in oklab, var(--foreground) 35%, transparent);
			cursor: pointer;
		}

		.agent-desk__who {
			display: none;
		}
	}
</style>
