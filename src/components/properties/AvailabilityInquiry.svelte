<script lang="ts">
	interface Props {
		propertySlug: string;
		propertyTitle: string;
	}

	const blockedDates = [
		"2026-08-15",
		"2026-08-16",
		"2026-08-17",
		"2026-08-22",
		"2026-08-23",
	];

	let { propertySlug, propertyTitle }: Props = $props();
	let checkIn = $state("");
	let checkOut = $state("");
	let error = $state("");

	function selectedStayIncludesBlockedDate() {
		let date = Date.parse(`${checkIn}T00:00:00Z`);
		const checkout = Date.parse(`${checkOut}T00:00:00Z`);

		while (date < checkout) {
			if (blockedDates.includes(new Date(date).toISOString().slice(0, 10))) return true;
			date += 86_400_000;
		}

		return false;
	}

	function submitInquiry(event: SubmitEvent) {
		event.preventDefault();

		if (!checkIn || !checkOut) {
			error = "Choose both check-in and check-out dates.";
			return;
		}

		if (checkOut <= checkIn) {
			error = "Check-out must be after check-in.";
			return;
		}

		if (selectedStayIncludesBlockedDate()) {
			error = "Those dates include a mocked unavailable date. Please choose another stay.";
			return;
		}

		const query = new URLSearchParams({
			intent: "booking-inquiry",
			property: propertySlug,
			checkIn,
			checkOut,
		});
		window.location.assign(`/contact?${query}`);
	}
</script>

<section class="availability" aria-labelledby="availability-title">
	<div>
		<p class="availability__eyebrow">Weekly rental inquiry</p>
		<h2 id="availability-title">Check availability for {propertyTitle}</h2>
		<p class="availability__copy">
			Choose dates to start an availability inquiry. Mocked unavailable dates are checked before
			you continue.
		</p>
	</div>

	<form onsubmit={submitInquiry}>
		<div class="availability__fields">
			<label>
				<span>Check-in</span>
				<input
					type="date"
					bind:value={checkIn}
					required
					aria-invalid={error ? "true" : undefined}
					aria-describedby={error ? "availability-error" : undefined}
					onchange={() => (error = "")}
				/>
			</label>
			<label>
				<span>Check-out</span>
				<input
					type="date"
					bind:value={checkOut}
					required
					aria-invalid={error ? "true" : undefined}
					aria-describedby={error ? "availability-error" : undefined}
					onchange={() => (error = "")}
				/>
			</label>
		</div>
		{#if error}
			<p id="availability-error" class="availability__error" role="alert">{error}</p>
		{/if}
		<button type="submit">Continue with availability inquiry</button>
	</form>

	<p class="availability__notice">
		Demo availability only. This inquiry is not a reservation, payment, or live offer.
	</p>
</section>

<style>
	.availability {
		display: grid;
		gap: var(--spacing-5);
		margin-top: var(--spacing-7);
		padding: var(--spacing-6);
		border: 1px solid var(--border);
		background: var(--secondary);
	}

	.availability__eyebrow {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.availability h2 {
		margin: var(--spacing-1) 0 0;
		font-size: var(--text-xl);
	}

	.availability__copy,
	.availability__notice {
		margin: var(--spacing-2) 0 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.availability form {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--spacing-4);
	}

	.availability__fields {
		display: flex;
		flex: 1 1 22rem;
		flex-wrap: wrap;
		gap: var(--spacing-3);
	}

	.availability label {
		display: grid;
		flex: 1 1 10rem;
		gap: var(--spacing-1);
		color: var(--foreground);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.availability input {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--card);
		color: var(--foreground);
		padding: var(--spacing-2);
		font: inherit;
	}

	.availability button {
		border: 1px solid var(--primary);
		border-radius: var(--radius-sm);
		background: var(--primary);
		color: var(--primary-foreground);
		padding: var(--spacing-2) var(--spacing-4);
		font: inherit;
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.availability button:hover {
		background: var(--primary-hover);
	}

	.availability__error {
		flex-basis: 100%;
		order: 2;
		margin: 0;
		color: var(--destructive);
		font-size: var(--text-sm);
	}

	.availability__notice {
		margin: 0;
	}
</style>
