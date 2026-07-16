<script lang="ts">
	import { onMount } from "svelte";
	import {
		parseFrontmatter,
		slugifyTitle,
		splitMarkdown,
		type ContentCollection,
		type ContentListItem,
	} from "../../lib/content-editor";
	import Field from "../ui/form/Field/Field.svelte";
	import Label from "../ui/form/Label/Label.svelte";
	import Separator from "../ui/layout/Separator/Separator.svelte";

	const SECRET_KEY = "osead-content-edit-secret";

	let collection = $state<ContentCollection>("blog");
	let items = $state<ContentListItem[]>([]);
	let mode = $state<"local" | "github" | "unavailable" | "unknown">("unknown");
	let status = $state<"idle" | "loading" | "saving" | "error">("idle");
	let message = $state("");
	let secret = $state("");

	let activeSlug = $state<string | null>(null);
	let isNew = $state(false);
	let sha = $state<string | undefined>();

	// Blog guided fields
	let title = $state("");
	let description = $state("");
	let tags = $state("");
	let draft = $state(false);
	let author = $state("O-sea-D");
	let body = $state("");

	// Pages: full raw editor
	let raw = $state("");

	const isBlog = $derived(collection === "blog");

	function authHeaders(): HeadersInit {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (secret.trim()) headers.Authorization = `Bearer ${secret.trim()}`;
		return headers;
	}

	async function loadList() {
		status = "loading";
		message = "";
		try {
			const response = await fetch(`/api/content?collection=${collection}`);
			const data = (await response.json()) as {
				error?: string;
				mode?: string;
				items?: ContentListItem[];
			};
			if (!response.ok) {
				mode = data.mode === "unavailable" ? "unavailable" : "unknown";
				items = [];
				status = "error";
				message =
					data.error ||
					"Content API unavailable. Run `pnpm dev` for local Markdown editing.";
				return;
			}
			mode = (data.mode as typeof mode) || "unknown";
			items = data.items ?? [];
			status = "idle";
		} catch {
			status = "error";
			message = "Could not reach /api/content.";
		}
	}

	async function openItem(slug: string) {
		status = "loading";
		message = "";
		isNew = false;
		activeSlug = slug;
		try {
			const response = await fetch(
				`/api/content?collection=${collection}&slug=${encodeURIComponent(slug)}`,
			);
			const data = (await response.json()) as {
				error?: string;
				raw?: string;
				sha?: string;
			};
			if (!response.ok || !data.raw) {
				status = "error";
				message = data.error || "Failed to load file.";
				return;
			}
			sha = data.sha;
			raw = data.raw;
			const parts = splitMarkdown(data.raw);
			const fm = parseFrontmatter(parts.frontmatter);
			title = typeof fm.title === "string" ? fm.title : slug;
			description = typeof fm.description === "string" ? fm.description : "";
			draft = fm.draft === true;
			author = typeof fm.author === "string" ? fm.author : "O-sea-D";
			tags = Array.isArray(fm.tags) ? fm.tags.map(String).join(", ") : "";
			body = parts.body;
			status = "idle";
		} catch {
			status = "error";
			message = "Failed to load file.";
		}
	}

	function startNew() {
		isNew = true;
		activeSlug = null;
		sha = undefined;
		title = "";
		description = "";
		tags = "";
		draft = true;
		author = "O-sea-D";
		body = "## New post\n\nWrite your story here.\n";
		raw =
			collection === "pages"
				? [
						"---",
						"translationKey: new-page",
						"locale: en",
						"slug: new-page",
						'title: "New page"',
						'description: "Edit this page description."',
						"sections: []",
						"isLegal: false",
						"order: 99",
						"---",
						"",
						"Page body goes here.",
						"",
					].join("\n")
				: "";
		message = "";
	}

	async function save() {
		status = "saving";
		message = "";
		const slug = isNew
			? slugifyTitle(title || "untitled")
			: (activeSlug ?? slugifyTitle(title));
		if (!slug) {
			status = "error";
			message = "Need a title (or slug) to save.";
			return;
		}

		const payload = isBlog
			? {
					collection,
					slug,
					title,
					description,
					body,
					draft,
					author,
					tags: tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean),
					sha,
				}
			: (() => {
					const parts = splitMarkdown(raw);
					const fm = parseFrontmatter(parts.frontmatter);
					const pageSlug =
						typeof fm.slug === "string" && fm.slug
							? slugifyTitle(String(fm.slug))
							: slugifyTitle(title || activeSlug || "new-page");
					return {
						collection,
						slug: pageSlug,
						raw,
						sha,
					};
				})();

		try {
			const response = await fetch("/api/content", {
				method: "PUT",
				headers: authHeaders(),
				body: JSON.stringify(payload),
			});
			const data = (await response.json()) as {
				error?: string;
				rebuild?: string;
				item?: ContentListItem;
			};
			if (!response.ok) {
				status = "error";
				message = data.error || "Save failed.";
				return;
			}
			activeSlug = data.item?.slug ?? slug;
			isNew = false;
			message = data.rebuild
				? `Saved. ${data.rebuild}`
				: "Saved to src/content. Refresh the journal page to preview.";
			status = "idle";
			await loadList();
		} catch {
			status = "error";
			message = "Save failed.";
		}
	}

	async function remove() {
		if (!activeSlug || isNew) return;
		if (!confirm(`Delete ${collection}/${activeSlug}.md?`)) return;
		status = "saving";
		try {
			const response = await fetch(
				`/api/content?collection=${collection}&slug=${encodeURIComponent(activeSlug)}`,
				{ method: "DELETE", headers: authHeaders() },
			);
			const data = (await response.json()) as { error?: string; rebuild?: string };
			if (!response.ok) {
				status = "error";
				message = data.error || "Delete failed.";
				return;
			}
			activeSlug = null;
			isNew = false;
			message = data.rebuild ? `Deleted. ${data.rebuild}` : "Deleted.";
			status = "idle";
			await loadList();
		} catch {
			status = "error";
			message = "Delete failed.";
		}
	}

	function persistSecret() {
		try {
			sessionStorage.setItem(SECRET_KEY, secret.trim());
		} catch {
			/* ignore */
		}
	}

	onMount(() => {
		try {
			secret = sessionStorage.getItem(SECRET_KEY) ?? "";
		} catch {
			secret = "";
		}
		void loadList();
	});
</script>

<section class="content-editor" aria-labelledby="content-editor-title">
	<header class="content-editor__head">
		<div>
			<p class="content-editor__eyebrow">Content</p>
			<h2 id="content-editor-title">Edit Markdown</h2>
			<p class="content-editor__lede">
				Blog posts use a simple form. Pages use full Markdown (frontmatter
				included). Local <code>pnpm dev</code> writes files immediately; on
				Pages, set GitHub + edit secret to publish (auto-rebuild).
			</p>
		</div>
		<span class="content-editor__mode" data-mode={mode}>{mode}</span>
	</header>

	<div class="content-editor__toolbar">
		<div class="content-editor__tabs" role="tablist" aria-label="Collections">
			<button
				type="button"
				class:is-active={collection === "blog"}
				onclick={() => {
					collection = "blog";
					activeSlug = null;
					void loadList();
				}}>Blog</button
			>
			<button
				type="button"
				class:is-active={collection === "pages"}
				onclick={() => {
					collection = "pages";
					activeSlug = null;
					void loadList();
				}}>Pages</button
			>
		</div>
		<button type="button" class="content-editor__new" onclick={startNew}
			>New {collection === "blog" ? "post" : "page"}</button
		>
	</div>

	{#if mode !== "local"}
		<Field>
			<Label for="content-secret">Edit secret (Pages only)</Label>
			<input
				id="content-secret"
				type="password"
				autocomplete="off"
				bind:value={secret}
				onblur={persistSecret}
				placeholder="CONTENT_EDIT_SECRET"
			/>
		</Field>
	{/if}

	<div class="content-editor__layout">
		<aside class="content-editor__list" aria-label="Files">
			{#if status === "loading" && items.length === 0}
				<p>Loading…</p>
			{:else if items.length === 0}
				<p>No files yet.</p>
			{:else}
				<ul>
					{#each items as item (item.path)}
						<li>
							<button
								type="button"
								class:is-active={activeSlug === item.slug}
								onclick={() => openItem(item.slug)}
							>
								<span>{item.title}</span>
								{#if item.draft}
									<em>draft</em>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</aside>

		<div class="content-editor__form">
			{#if !activeSlug && !isNew}
				<p class="content-editor__empty">
					Select a file or create a new {collection === "blog" ? "post" : "page"}.
				</p>
			{:else if isBlog}
				<Field>
					<Label for="ce-title" required>Title</Label>
					<input id="ce-title" bind:value={title} />
				</Field>
				<Field>
					<Label for="ce-desc" required>Description</Label>
					<input id="ce-desc" bind:value={description} />
				</Field>
				<Field>
					<Label for="ce-tags">Tags (comma-separated)</Label>
					<input id="ce-tags" bind:value={tags} />
				</Field>
				<Field>
					<Label for="ce-author">Author</Label>
					<input id="ce-author" bind:value={author} />
				</Field>
				<label class="content-editor__draft">
					<input type="checkbox" bind:checked={draft} />
					Draft (hidden from public journal)
				</label>
				<Field>
					<Label for="ce-body">Body (Markdown)</Label>
					<textarea id="ce-body" rows="14" bind:value={body}></textarea>
				</Field>
			{:else}
				<p class="content-editor__hint">
					Editing <code>{activeSlug ?? "new"}.md</code> — keep the YAML
					frontmatter block intact.
				</p>
				<Field>
					<Label for="ce-raw">Raw Markdown</Label>
					<textarea id="ce-raw" rows="22" bind:value={raw}></textarea>
				</Field>
			{/if}

			{#if activeSlug || isNew}
				<div class="content-editor__actions">
					<button
						type="button"
						class="content-editor__save"
						disabled={status === "saving"}
						onclick={save}
					>
						{status === "saving" ? "Saving…" : "Save"}
					</button>
					{#if activeSlug && !isNew}
						<button type="button" class="content-editor__delete" onclick={remove}
							>Delete</button
						>
					{/if}
					{#if isBlog && (activeSlug || title)}
						<a
							class="content-editor__preview"
							href={`/blog/${activeSlug ?? slugifyTitle(title)}`}
							target="_blank"
							rel="noreferrer">Preview</a
						>
					{/if}
				</div>
			{/if}

			{#if message}
				<p
					class="content-editor__message"
					class:is-error={status === "error"}
					role="status"
				>
					{message}
				</p>
			{/if}
		</div>
	</div>

	<Separator class="content-editor__rule" />
	<p class="content-editor__footnote">
		Writes land in <code>src/content/{collection}/</code>. Properties stay in
		git for now — too many structured fields for this form.
	</p>
</section>

<style>
	.content-editor {
		display: grid;
		gap: var(--spacing-4);
		padding: 1rem 1.05rem;
		border: 1px solid var(--border);
	}

	.content-editor__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.content-editor__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.content-editor h2 {
		margin: 0.2rem 0 0;
		font-size: 1.2rem;
	}

	.content-editor__lede {
		margin: 0.4rem 0 0;
		max-width: 48ch;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
		line-height: 1.45;
	}

	.content-editor__mode {
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--border);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.content-editor__toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: center;
	}

	.content-editor__tabs {
		display: flex;
		gap: 0.35rem;
	}

	.content-editor__tabs button,
	.content-editor__new,
	.content-editor__save,
	.content-editor__delete,
	.content-editor__list button {
		font: inherit;
		cursor: pointer;
	}

	.content-editor__tabs button,
	.content-editor__new {
		padding: 0.4rem 0.7rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.content-editor__tabs button.is-active,
	.content-editor__new {
		border-color: var(--foreground);
	}

	.content-editor__new {
		background: var(--primary);
		color: var(--primary-foreground);
		border-color: transparent;
	}

	.content-editor__layout {
		display: grid;
		gap: 1rem;
		grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr);
	}

	.content-editor__list ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
	}

	.content-editor__list button {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.55rem;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		text-align: left;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.content-editor__list button.is-active,
	.content-editor__list button:hover {
		border-color: var(--foreground);
	}

	.content-editor__list em {
		font-style: normal;
		font-size: var(--text-xs);
		color: var(--muted-foreground);
		text-transform: uppercase;
	}

	.content-editor__form {
		display: grid;
		gap: 0.75rem;
	}

	.content-editor__form :global(input),
	.content-editor__form :global(textarea) {
		width: 100%;
		padding: 0.55rem 0.65rem;
		border: 1px solid var(--border);
		background: var(--background);
		color: inherit;
		font: inherit;
		font-size: var(--text-sm);
	}

	.content-editor__form :global(textarea) {
		font-family: var(--font-mono, ui-monospace, monospace);
		line-height: 1.45;
		resize: vertical;
	}

	.content-editor__draft {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.content-editor__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		align-items: center;
	}

	.content-editor__save {
		padding: 0.55rem 0.9rem;
		border: 0;
		background: var(--primary);
		color: var(--primary-foreground);
		font-weight: 700;
	}

	.content-editor__delete {
		padding: 0.55rem 0.9rem;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--muted-foreground);
		font-weight: 600;
	}

	.content-editor__preview {
		font-size: var(--text-sm);
		font-weight: 700;
		color: inherit;
	}

	.content-editor__empty,
	.content-editor__hint,
	.content-editor__footnote,
	.content-editor__message {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted-foreground);
	}

	.content-editor__message.is-error {
		color: var(--destructive);
	}

	.content-editor__rule {
		margin-top: 0.25rem;
	}

	@media (max-width: 48rem) {
		.content-editor__layout {
			grid-template-columns: 1fr;
		}
	}
</style>
