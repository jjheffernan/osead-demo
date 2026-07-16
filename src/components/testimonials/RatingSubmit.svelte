<script lang="ts">
	import type { TestimonialTarget } from "../../lib/testimonials";

	interface Props {
		targetType: TestimonialTarget;
		targetId: string;
		label?: string;
	}

	let { targetType, targetId, label = "Share a rating" }: Props = $props();

	let name = $state("");
	let email = $state("");
	let rating = $state(5);
	let quote = $state("");
	let website = $state(""); // honeypot
	let status = $state<"idle" | "sending" | "thanks" | "error">("idle");
	let error = $state("");

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = "";
		status = "sending";

		const message = [
			`Rating submission (${targetType}:${targetId}) — ${rating}/5`,
			quote.trim(),
		].join("\n\n");

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					message,
					intent: "rating",
					property: `${targetType}:${targetId}`,
					website,
					rating,
				}),
			});

			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				error = body?.error || "Could not send your rating. Please try again.";
				status = "error";
				return;
			}

			status = "thanks";
			name = "";
			email = "";
			quote = "";
			rating = 5;
		} catch {
			error = "Could not send your rating. Please try again.";
			status = "error";
		}
	}
</script>

<section class="rating-submit" aria-labelledby="rating-submit-title">
	<h2 id="rating-submit-title">{label}</h2>
	<p class="rating-submit__note">
		Demo only — submissions become inquiry leads (no public publish, no database).
	</p>

	{#if status === "thanks"}
		<p class="rating-submit__thanks" role="status">
			Thanks — we received your rating inquiry.
		</p>
	{:else}
		<form onsubmit={onSubmit}>
			<div class="rating-submit__honeypot" aria-hidden="true">
				<label>
					Website
					<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
				</label>
			</div>

			<label>
				<span>Name</span>
				<input type="text" name="name" required maxlength="120" bind:value={name} />
			</label>
			<label>
				<span>Email</span>
				<input type="email" name="email" required maxlength="254" bind:value={email} />
			</label>
			<label>
				<span>Rating</span>
				<select name="rating" bind:value={rating}>
					<option value={5}>5 — Excellent</option>
					<option value={4}>4 — Good</option>
					<option value={3}>3 — Fine</option>
					<option value={2}>2 — Fair</option>
					<option value={1}>1 — Poor</option>
				</select>
			</label>
			<label class="rating-submit__full">
				<span>Your note</span>
				<textarea
					name="quote"
					rows="3"
					required
					minlength="10"
					maxlength="2000"
					bind:value={quote}
					placeholder="What stood out about this home, person, or office?"
				></textarea>
			</label>

			{#if error}
				<p class="rating-submit__error" role="alert">{error}</p>
			{/if}

			<button type="submit" disabled={status === "sending"}>
				{status === "sending" ? "Sending…" : "Send rating inquiry"}
			</button>
		</form>
	{/if}
</section>

<style>
	.rating-submit {
		display: grid;
		gap: var(--spacing-3, 0.75rem);
		padding: var(--spacing-5, 1.25rem);
		border: 1px solid var(--border);
		background: var(--secondary);
	}

	.rating-submit h2 {
		margin: 0;
		font-size: var(--text-lg, 1.125rem);
	}

	.rating-submit__note,
	.rating-submit__thanks {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm, 0.9rem);
		line-height: 1.45;
	}

	.rating-submit form {
		display: grid;
		gap: var(--spacing-3, 0.75rem);
	}

	.rating-submit label {
		display: grid;
		gap: 0.25rem;
		font-size: var(--text-sm, 0.9rem);
		font-weight: var(--font-weight-semibold, 600);
	}

	.rating-submit input,
	.rating-submit select,
	.rating-submit textarea {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm, 0.25rem);
		background: var(--card);
		color: var(--foreground);
		padding: var(--spacing-2, 0.5rem);
		font: inherit;
		font-weight: 400;
	}

	.rating-submit__full {
		grid-column: 1 / -1;
	}

	.rating-submit__honeypot {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.rating-submit button {
		justify-self: start;
		border: 1px solid var(--primary);
		border-radius: var(--radius-sm, 0.25rem);
		background: var(--primary);
		color: var(--primary-foreground);
		padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
		font: inherit;
		font-weight: var(--font-weight-semibold, 600);
		cursor: pointer;
	}

	.rating-submit button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.rating-submit__error {
		margin: 0;
		color: var(--destructive);
		font-size: var(--text-sm, 0.9rem);
	}
</style>
