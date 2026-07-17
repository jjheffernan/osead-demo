<script lang="ts">
	import { onMount } from "svelte";
	import { clearDemoAccount, readDemoAccount } from "../../lib/demo-account";
	import { readInquiries, readSavedListings, type Inquiry } from "../../lib/guest-store";

	export interface GuestProperty {
		slug: string;
		title: string;
		href: string;
	}

	interface Props {
		properties: GuestProperty[];
	}

	const { properties }: Props = $props();

	let name = $state("Guest");
	let email = $state("");
	let sessionAt = $state("");
	let savedSlugs = $state<string[]>([]);
	let inquiries = $state<Inquiry[]>([]);

	function findProperty(slug: string): GuestProperty | undefined {
		return properties.find((property) => property.slug === slug);
	}

	const savedHomes = $derived(savedSlugs.map((slug) => ({ slug, property: findProperty(slug) })));

	const inquiryRows = $derived(
		[...inquiries]
			.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
			.map((inquiry) => ({ inquiry, property: findProperty(inquiry.propertySlug) })),
	);

	function intentLabel(intent: string): string {
		if (intent === "booking-inquiry") return "Booking inquiry";
		if (intent === "rental") return "Rental";
		if (intent === "sale") return "Sale";
		if (intent === "rating") return "Rating";
		return intent;
	}

	function signOut() {
		clearDemoAccount();
		window.location.assign("/login");
	}

	onMount(() => {
		const account = readDemoAccount();
		if (account) {
			name = account.name;
			email = account.email;
			sessionAt = new Date(account.at).toLocaleString();
		}
		savedSlugs = readSavedListings();
		inquiries = readInquiries();
	});
</script>

<section class="guest-hub container" aria-label="Guest account">
	<header class="guest-hub__head">
		<p class="guest-hub__eyebrow">Demo account</p>
		<h1>Welcome, {name}</h1>
		<p class="guest-hub__meta">
			Signed in as <strong>{email}</strong>. Session started
			<time datetime={sessionAt}>{sessionAt}</time>.
		</p>
	</header>

	<section class="guest-hub__panel" aria-labelledby="saved-homes-title">
		<h2 id="saved-homes-title">Saved homes</h2>
		{#if savedHomes.length === 0}
			<p class="guest-hub__empty">
				No saved homes yet. <a href="/rentals">Browse rentals</a> and save a favorite to
				see it here.
			</p>
		{:else}
			<ul class="guest-hub__list">
				{#each savedHomes as home (home.slug)}
					<li>
						{#if home.property}
							<a href={home.property.href}>{home.property.title}</a>
						{:else}
							<span>{home.slug}</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="guest-hub__panel" aria-labelledby="inquiry-history-title">
		<h2 id="inquiry-history-title">Inquiry history</h2>
		{#if inquiryRows.length === 0}
			<p class="guest-hub__empty">
				No inquiries yet. Check availability on a listing or
				<a href="/contact">message an agent</a> to get started.
			</p>
		{:else}
			<ul class="guest-hub__list guest-hub__list--inquiries">
				{#each inquiryRows as row (row.inquiry.submittedAt + row.inquiry.propertySlug)}
					<li>
						<div class="guest-hub__inquiry-main">
							<span class="guest-hub__inquiry-property">
								{row.property ? row.property.title : row.inquiry.propertySlug}
							</span>
							<span class="guest-hub__inquiry-intent">{intentLabel(row.inquiry.intent)}</span>
						</div>
						{#if row.inquiry.checkIn && row.inquiry.checkOut}
							<span class="guest-hub__inquiry-dates">
								{row.inquiry.checkIn} → {row.inquiry.checkOut}
							</span>
						{/if}
						<span class="guest-hub__inquiry-status">
							Submitted {new Date(row.inquiry.submittedAt).toLocaleDateString()}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<div class="guest-hub__actions">
		<a class="guest-hub__cta" href="/rentals">Browse rentals</a>
		<a class="guest-hub__cta guest-hub__cta--ghost" href="/sales">Browse sales</a>
		<a class="guest-hub__cta guest-hub__cta--ghost" href="/contact">Message your agent</a>
		<button type="button" class="guest-hub__signout" onclick={signOut}>Sign out</button>
	</div>
</section>

<style>
	.guest-hub {
		max-width: 42rem;
		padding-block: clamp(2.5rem, 8vw, 5rem);
		display: grid;
		gap: 1.75rem;
	}

	.guest-hub__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.guest-hub__head h1 {
		margin: 0.35rem 0 0;
		font-size: clamp(1.75rem, 3vw, 2.25rem);
	}

	.guest-hub__meta {
		margin: 0.75rem 0 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.guest-hub__panel {
		display: grid;
		gap: 0.65rem;
		padding: 1.1rem 1.25rem;
		border: 1px solid var(--border);
	}

	.guest-hub__panel h2 {
		margin: 0;
		font-size: 1rem;
	}

	.guest-hub__empty {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.guest-hub__empty a {
		color: var(--foreground);
		font-weight: 700;
	}

	.guest-hub__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}

	.guest-hub__list > li {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.guest-hub__list > li:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}

	.guest-hub__list a {
		font-weight: 700;
		color: inherit;
		text-decoration: none;
	}

	.guest-hub__list a:hover {
		text-decoration: underline;
	}

	.guest-hub__list--inquiries > li {
		display: grid;
		gap: 0.15rem;
	}

	.guest-hub__inquiry-main {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
		font-weight: 700;
	}

	.guest-hub__inquiry-intent {
		font-weight: 600;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.guest-hub__inquiry-dates,
	.guest-hub__inquiry-status {
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.guest-hub__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem 1.15rem;
		align-items: center;
	}

	.guest-hub__cta {
		display: inline-flex;
		padding: 0.65rem 1.1rem;
		background: var(--primary);
		color: var(--primary-foreground);
		font-weight: 700;
		text-decoration: none;
	}

	.guest-hub__cta--ghost {
		background: transparent;
		color: inherit;
		border: 1px solid var(--border);
	}

	.guest-hub__signout {
		margin-left: auto;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}
</style>
