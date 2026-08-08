<script lang="ts">
	import { onMount } from "svelte";
	import {
		canComment,
		readDemoAccount,
		type DemoRole,
	} from "../../lib/demo-account";
	import {
		addComment,
		isVerifiedClient,
		readComments,
		type SocialComment,
	} from "../../lib/social-store";

	interface Props {
		propertySlug: string;
		propertyTitle: string;
	}

	const { propertySlug, propertyTitle }: Props = $props();

	let comments = $state<SocialComment[]>([]);
	let role = $state<DemoRole | null>(null);
	let name = $state("");
	let email = $state("");
	let body = $state("");
	let status = $state<"idle" | "saved" | "error">("idle");
	let live = $state("");

	const canPost = $derived(role !== null && canComment(role));

	function refresh() {
		comments = [...readComments(propertySlug)].sort((a, b) =>
			b.at.localeCompare(a.at),
		);
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		status = "idle";
		live = "";
		const trimmed = body.trim();
		if (!trimmed || !canPost) {
			status = "error";
			return;
		}
		addComment({
			targetId: propertySlug,
			body: trimmed,
			authorName: name || "Guest",
			authorEmail: email,
		});
		body = "";
		status = "saved";
		live = "Comment posted.";
		refresh();
	}

	onMount(() => {
		const account = readDemoAccount();
		if (account) {
			role = account.role;
			name = account.name;
			email = account.email;
		}
		refresh();
	});
</script>

<section class="listing-comments" id="comments" aria-labelledby="listing-comments-title">
	<h2 id="listing-comments-title">Comments on {propertyTitle}</h2>
	<p class="listing-comments__note">Demo social — stored in this browser until CF D1 deepen.</p>
	<p class="listing-comments__live" role="status" aria-live="polite">{live}</p>

	{#if comments.length === 0}
		<p class="listing-comments__empty">No comments yet.</p>
	{:else}
		<ul class="listing-comments__list">
			{#each comments as comment (comment.id)}
				<li>
					<p class="listing-comments__body">{comment.body}</p>
					<p class="listing-comments__meta">
						{comment.authorName}
						{#if isVerifiedClient(comment.authorEmail)}
							<span class="listing-comments__badge">Verified client</span>
						{/if}
						· {new Date(comment.at).toLocaleDateString()}
					</p>
				</li>
			{/each}
		</ul>
	{/if}

	{#if canPost}
		<form class="listing-comments__form" onsubmit={submit}>
			<label>
				<span class="sr-only">Your comment</span>
				<textarea
					bind:value={body}
					rows="3"
					required
					maxlength="500"
					placeholder="Share a note about this home"
				></textarea>
			</label>
			<button type="submit">Post comment</button>
			{#if status === "error"}
				<p class="listing-comments__error" role="alert">Enter a comment to post.</p>
			{/if}
		</form>
	{:else if role === null}
		<p class="listing-comments__cta">
			<a href="/login">Sign in as a guest</a> to comment.
		</p>
	{:else}
		<p class="listing-comments__cta">Guest accounts can leave comments.</p>
	{/if}
</section>

<style>
	.listing-comments {
		margin-block: var(--space-8, 2rem);
		display: grid;
		gap: var(--space-4, 1rem);
	}

	.listing-comments h2 {
		font-family: var(--font-display, inherit);
		font-size: var(--text-xl, 1.25rem);
		margin: 0;
	}

	.listing-comments__note,
	.listing-comments__empty,
	.listing-comments__cta,
	.listing-comments__meta {
		color: var(--color-fg-muted, inherit);
		font-size: var(--text-sm, 0.875rem);
		margin: 0;
	}

	.listing-comments__live:empty {
		display: none;
	}

	.listing-comments__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3, 0.75rem);
	}

	.listing-comments__body {
		margin: 0 0 0.25rem;
	}

	.listing-comments__badge {
		display: inline-block;
		margin-inline: 0.35rem;
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--color-border, currentColor);
		font-size: 0.75rem;
	}

	.listing-comments__form {
		display: grid;
		gap: var(--space-3, 0.75rem);
		max-width: 36rem;
	}

	.listing-comments__form textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border, currentColor);
		background: var(--color-bg, transparent);
		color: inherit;
		font: inherit;
	}

	.listing-comments__form button {
		justify-self: start;
		padding: 0.55rem 1rem;
		border: 1px solid var(--color-border, currentColor);
		background: var(--color-fg, currentColor);
		color: var(--color-bg, #fff);
		cursor: pointer;
		font: inherit;
	}

	.listing-comments__error {
		color: var(--color-danger, crimson);
		margin: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>
