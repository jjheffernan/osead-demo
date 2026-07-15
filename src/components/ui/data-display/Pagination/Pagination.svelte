<script lang="ts">
	import type { Locale } from "../../../../lib/site-config";
	import { t } from "../../../../i18n/ui";

	interface Props {
		currentPage: number;
		totalPages: number;
		basePath: string;
		query?: Record<string, string | undefined>;
		locale?: Locale;
	}

	const { currentPage, totalPages, basePath, query = {}, locale = "en" }: Props = $props();

	const pages = $derived(Array.from({ length: totalPages }, (_, index) => index + 1));

	function pageHref(page: number) {
		const params = new URLSearchParams();
		Object.entries(query).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});
		if (page > 1) params.set("page", String(page));
		const search = params.toString();
		return search ? `${basePath}?${search}` : basePath;
	}
</script>

<nav
	class="ui-pagination"
	aria-label={`${t(locale, "pagination.page")} ${currentPage} ${t(locale, "pagination.of")} ${totalPages}`}
>
	{#if currentPage > 1}
		<a href={pageHref(currentPage - 1)}>{t(locale, "pagination.prev")}</a>
	{/if}
	<ol>
		{#each pages as page (page)}
			<li>
				{#if page === currentPage}
					<span aria-current="page">{page}</span>
				{:else}
					<a href={pageHref(page)}>
						{t(locale, "pagination.page")} {page}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
	{#if currentPage < totalPages}
		<a href={pageHref(currentPage + 1)}>{t(locale, "pagination.next")}</a>
	{/if}
</nav>

<style>
	.ui-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
	}
	.ui-pagination ol {
		display: flex;
		gap: 0.4rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.ui-pagination a,
	.ui-pagination span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		min-height: 2rem;
		padding: 0 0.5rem;
		border-radius: 9999px;
		text-decoration: none;
		border: 1px solid var(--color-border);
	}
</style>
