<script lang="ts">
	import { onMount } from "svelte";
	import { canModerateSocial, canSetAnonymousListing } from "../../lib/demo-account";
	import { demoStaff } from "../../config/staff";
	import {
		readComments,
		readRatings,
		readVerifiedEmails,
		setVerifiedClient,
		socialCounts,
		type SocialComment,
		type SocialRating,
	} from "../../lib/social-store";

	export interface AccessListing {
		slug: string;
		title: string;
		href: string;
		agentId?: string;
		attribution: "attributed" | "anonymous";
	}

	interface Props {
		listings: AccessListing[];
		role: "admin" | "agent" | "guest";
	}

	const { listings, role }: Props = $props();

	let comments = $state<SocialComment[]>([]);
	let ratings = $state<SocialRating[]>([]);
	let verified = $state<string[]>([]);
	let verifyEmail = $state("");
	let status = $state("");
	let counts = $state({ comments: 0, ratings: 0, verified: 0 });

	const anonymous = $derived(
		listings.filter((l) => l.attribution === "anonymous"),
	);
	const attributed = $derived(
		listings.filter((l) => l.attribution !== "anonymous"),
	);

	const coverage = $derived(
		demoStaff.map((staff) => ({
			staff,
			count: listings.filter(
				(l) => l.agentId === staff.id && l.attribution !== "anonymous",
			).length,
		})),
	);

	function refresh() {
		comments = [...readComments()]
			.sort((a, b) => b.at.localeCompare(a.at))
			.slice(0, 20);
		ratings = [...readRatings()]
			.sort((a, b) => b.at.localeCompare(a.at))
			.slice(0, 20);
		verified = readVerifiedEmails();
		counts = socialCounts();
	}

	function toggleVerified(event: SubmitEvent) {
		event.preventDefault();
		if (!canModerateSocial(role)) return;
		const email = verifyEmail.trim().toLowerCase();
		if (!email) return;
		const next = !verified.includes(email);
		setVerifiedClient(email, next);
		verifyEmail = "";
		status = next ? `Verified ${email}` : `Removed verified flag for ${email}`;
		refresh();
	}

	onMount(refresh);
</script>

<section class="access-panel" aria-labelledby="access-title">
	<header class="access-panel__head">
		<div>
			<h2 id="access-title">Access &amp; social</h2>
			<p>
				Demo observability for guest social + listing attribution. Persistence is
				local until CF D1 deepen (<code>docs/specs/cf-deepen.md</code>).
			</p>
		</div>
		<p class="access-panel__counts" aria-label="Social counts">
			<span>{counts.comments} comments</span>
			<span>{counts.ratings} ratings</span>
			<span>{counts.verified} verified</span>
		</p>
	</header>

	<section aria-labelledby="mod-queue-title">
		<h3 id="mod-queue-title">Recent comments</h3>
		{#if comments.length === 0}
			<p class="access-panel__empty">No comments in this browser yet.</p>
		{:else}
			<ul class="access-panel__list">
				{#each comments as comment (comment.id)}
					<li>
						<strong>{comment.authorEmail}</strong> on {comment.targetId}:
						{comment.body}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="ratings-queue-title">
		<h3 id="ratings-queue-title">Recent ratings</h3>
		{#if ratings.length === 0}
			<p class="access-panel__empty">No ratings in this browser yet.</p>
		{:else}
			<ul class="access-panel__list">
				{#each ratings as row (row.id)}
					<li>
						<strong>{row.authorEmail}</strong> — {row.rating}/5 on {row.targetId}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="verified-title">
		<h3 id="verified-title">Verified clients</h3>
		{#if verified.length === 0}
			<p class="access-panel__empty">None flagged yet.</p>
		{:else}
			<ul class="access-panel__list">
				{#each verified as email (email)}
					<li>{email}</li>
				{/each}
			</ul>
		{/if}
		{#if canModerateSocial(role)}
			<form class="access-panel__form" onsubmit={toggleVerified}>
				<label>
					Guest email
					<input type="email" bind:value={verifyEmail} required placeholder="guest@example.com" />
				</label>
				<button type="submit">Toggle verified</button>
			</form>
			<p class="access-panel__status" role="status">{status}</p>
		{/if}
	</section>

	<section aria-labelledby="attr-title">
		<h3 id="attr-title">Listing attribution</h3>
		<p class="access-panel__empty">
			Anonymous: {anonymous.length} · Attributed: {attributed.length}
			{#if canSetAnonymousListing(role)}
				— set <code>attribution</code> in property frontmatter (Content panel).
			{/if}
		</p>
		{#if anonymous.length > 0}
			<ul class="access-panel__list">
				{#each anonymous as listing (listing.slug)}
					<li>
						<a href={listing.href}>{listing.title}</a> — anonymous
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="coverage-title">
		<h3 id="coverage-title">Agent attachment coverage</h3>
		<ul class="access-panel__list">
			{#each coverage as row (row.staff.id)}
				<li>
					{row.staff.name}: {row.count} listing{row.count === 1 ? "" : "s"}
					{#if row.count === 0}
						<span class="access-panel__warn"> — none attached</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="health-title">
		<h3 id="health-title">Access health</h3>
		<ul class="access-panel__list">
			<li>GuestHub / AgentDesk / AdminShell present</li>
			<li>Capability helpers in <code>demo-account.ts</code></li>
			<li>CF deepen schema: <code>migrations/0001_cf_deepen.sql</code></li>
		</ul>
	</section>
</section>

<style>
	.access-panel {
		display: grid;
		gap: 1.5rem;
	}

	.access-panel__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
	}

	.access-panel__head h2 {
		margin: 0 0 0.35rem;
	}

	.access-panel__head p {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		max-width: 40rem;
	}

	.access-panel__counts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.access-panel h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}

	.access-panel__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
		font-size: var(--text-sm);
	}

	.access-panel__empty,
	.access-panel__status {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.access-panel__warn {
		color: var(--muted-foreground);
		font-style: italic;
	}

	.access-panel__form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: end;
		margin-top: 0.75rem;
	}

	.access-panel__form label {
		display: grid;
		gap: 0.25rem;
		font-size: var(--text-sm);
	}

	.access-panel__form input {
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: inherit;
		font: inherit;
		min-width: 16rem;
	}

	.access-panel__form button {
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--border);
		background: var(--primary);
		color: var(--primary-foreground);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
</style>
