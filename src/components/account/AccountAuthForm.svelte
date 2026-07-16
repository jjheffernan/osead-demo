<script lang="ts">
	import {
		DEMO_ADMIN,
		isDemoAdminCredentials,
		writeDemoAccount,
		writeDemoAdminSession,
	} from "../../lib/demo-account";
	import Field from "../ui/form/Field/Field.svelte";
	import Label from "../ui/form/Label/Label.svelte";
	import Separator from "../ui/layout/Separator/Separator.svelte";

	interface Props {
		mode: "register" | "login";
	}

	const { mode }: Props = $props();

	let name = $state("");
	let email = $state(mode === "login" ? DEMO_ADMIN.email : "");
	let password = $state(mode === "login" ? DEMO_ADMIN.password : "");
	let confirm = $state("");
	let website = $state("");
	let error = $state("");
	let status = $state<"idle" | "sending">("idle");

	const isRegister = $derived(mode === "register");
	const endpoint = $derived(isRegister ? "/api/register" : "/api/login");
	const title = $derived(isRegister ? "Create an account" : "Sign in");
	const submitLabel = $derived(
		status === "sending"
			? isRegister
				? "Creating…"
				: "Signing in…"
			: isRegister
				? "Create account"
				: "Sign in",
	);

	function enterSession(opts: {
		name: string;
		email: string;
		role?: "admin" | "user";
	}) {
		writeDemoAccount(opts);
		window.location.assign("/account");
	}

	function continueAsAdmin() {
		writeDemoAdminSession();
		window.location.assign("/account");
	}

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = "";

		if (isRegister && password !== confirm) {
			error = "Passwords do not match.";
			return;
		}
		if (password.length < 8) {
			error = "Password must be at least 8 characters.";
			return;
		}

		if (!isRegister && isDemoAdminCredentials(email, password)) {
			enterSession({
				name: DEMO_ADMIN.name,
				email: DEMO_ADMIN.email,
				role: "admin",
			});
			return;
		}

		status = "sending";
		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: isRegister ? name : undefined,
					email,
					password,
					website,
				}),
			});
			const body = (await response.json().catch(() => null)) as {
				error?: string;
				name?: string;
				email?: string;
				role?: "admin" | "user";
			} | null;

			// Pages Functions only run on Cloudflare; 404 in `astro dev` → local session.
			if (!response.ok && response.status !== 404) {
				error = body?.error || "Something went wrong. Please try again.";
				status = "idle";
				return;
			}

			enterSession({
				name: body?.name || name || email.split("@")[0] || "Guest",
				email: body?.email || email,
				role: body?.role,
			});
		} catch {
			enterSession({
				name: name || email.split("@")[0] || "Guest",
				email,
			});
		}
	}
</script>

<section class="account-auth" aria-labelledby="account-auth-title">
	<header class="account-auth__head">
		<p class="account-auth__eyebrow">Demo account</p>
		<h1 id="account-auth-title">{title}</h1>
		<p>
			{#if isRegister}
				Local demo session only — nothing is stored on the server. Use this to
				walk the signup path before wiring real auth.
			{:else}
				Use the demo admin below for local click-through and admin tools, or any
				8+ character password for a plain user session.
			{/if}
		</p>
	</header>

	{#if !isRegister}
		<div class="account-auth__admin">
			<p class="account-auth__admin-label">Local demo admin</p>
			<p class="account-auth__creds">
				<code>{DEMO_ADMIN.email}</code>
				/
				<code>{DEMO_ADMIN.password}</code>
			</p>
			<button type="button" class="account-auth__admin-btn" onclick={continueAsAdmin}>
				Continue as demo admin
			</button>
		</div>
		<Separator class="account-auth__rule" />
	{/if}

	<form class="account-auth__form" onsubmit={onSubmit}>
		<div class="account-auth__honeypot" aria-hidden="true">
			<label>
				<span>Website</span>
				<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
			</label>
		</div>

		{#if isRegister}
			<Field>
				<Label for="account-name" required>Name</Label>
				<input id="account-name" name="name" autocomplete="name" required bind:value={name} />
			</Field>
		{/if}

		<Field>
			<Label for="account-email" required>Email</Label>
			<input
				id="account-email"
				name="email"
				type="email"
				autocomplete="email"
				required
				bind:value={email}
			/>
		</Field>

		<Field>
			<Label for="account-password" required>Password</Label>
			<input
				id="account-password"
				name="password"
				type="password"
				autocomplete={isRegister ? "new-password" : "current-password"}
				minlength="8"
				required
				bind:value={password}
			/>
		</Field>

		{#if isRegister}
			<Field>
				<Label for="account-confirm" required>Confirm password</Label>
				<input
					id="account-confirm"
					name="confirm"
					type="password"
					autocomplete="new-password"
					minlength="8"
					required
					bind:value={confirm}
				/>
			</Field>
		{/if}

		{#if error}
			<p class="account-auth__error" role="alert">{error}</p>
		{/if}

		<button type="submit" disabled={status === "sending"}>{submitLabel}</button>
	</form>

	<p class="account-auth__switch">
		{#if isRegister}
			Already have a demo session? <a href="/login">Sign in</a>
		{:else}
			Need an account? <a href="/register">Create one</a>
		{/if}
	</p>
</section>

<style>
	.account-auth {
		max-width: 28rem;
		margin-inline: auto;
		padding-block: clamp(2rem, 5vw, 3.5rem);
	}

	.account-auth__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.account-auth__head h1 {
		margin: 0.35rem 0 0;
		font-size: clamp(1.75rem, 3vw, 2.25rem);
	}

	.account-auth__head p {
		margin: 0.65rem 0 0;
		color: var(--muted-foreground);
		line-height: 1.5;
	}

	.account-auth__admin {
		margin-top: 1.25rem;
		padding: 1rem;
		border: 1px solid var(--border);
		background: color-mix(in oklab, var(--card) 85%, transparent);
		display: grid;
		gap: 0.55rem;
	}

	.account-auth__admin-label {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.account-auth__creds {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.account-auth__creds code {
		font-size: 0.85em;
	}

	.account-auth__admin-btn {
		justify-self: start;
		padding: 0.6rem 0.95rem;
		border: 0;
		background: var(--primary);
		color: var(--primary-foreground);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.account-auth__form {
		display: grid;
		gap: 0.85rem;
		margin-top: 1.5rem;
	}

	.account-auth__rule {
		margin-block: 1.1rem;
	}

	.account-auth__form :global(.ui-field input) {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: var(--foreground);
		font: inherit;
	}

	.account-auth__honeypot {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.account-auth__form button {
		margin-top: 0.35rem;
		padding: 0.75rem 1rem;
		border: 0;
		background: var(--secondary);
		color: var(--secondary-foreground);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.account-auth__form button:disabled {
		opacity: 0.65;
		cursor: wait;
	}

	.account-auth__error {
		margin: 0;
		color: var(--destructive);
		font-size: var(--text-sm);
	}

	.account-auth__switch {
		margin: 1.25rem 0 0;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
	}

	.account-auth__switch a {
		color: inherit;
		font-weight: 700;
	}
</style>
