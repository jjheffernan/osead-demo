<script lang="ts">
	export interface FAQItem {
		question: string;
		answer: string;
	}

	interface Props {
		title?: string;
		items: FAQItem[];
	}

	const { title, items }: Props = $props();

	const schema = $derived(
		items.length
			? {
					"@context": "https://schema.org",
					"@type": "FAQPage",
					mainEntity: items.map((item) => ({
						"@type": "Question",
						name: item.question,
						acceptedAnswer: {
							"@type": "Answer",
							text: item.answer,
						},
					})),
				}
			: null,
	);

	// Accordion: only one item open at a time.
	let openIndex = $state<number | null>(null);
</script>

<section class="faq container">
	{#if title}
		<h2 class="faq__title">{title}</h2>
	{/if}
	<div class="faq__list">
		{#each items as item, index (item.question)}
			<details
				class="faq__item"
				open={openIndex === index}
				ontoggle={(event) => {
					const isOpen = (event.currentTarget as HTMLDetailsElement).open;
					openIndex = isOpen ? index : openIndex === index ? null : openIndex;
				}}
			>
				<summary class="faq__question">
					<span>{item.question}</span>
					<svg
						class="faq__chevron"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M7 7L10 10L13 7"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</summary>
				<p class="faq__answer">{item.answer}</p>
			</details>
		{/each}
	</div>
</section>

{#if schema}
	<script type="application/ld+json">{JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
{/if}

<style>
	.faq {
		padding-block: var(--space-2xl);
	}

	.faq__title {
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 700;
		text-align: center;
		margin: 0 0 var(--space-xl);
	}

	.faq__list {
		max-width: 42rem;
		margin: 0 auto;
	}

	.faq__item {
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-md) 0;
	}

	.faq__question {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
		padding: var(--space-sm) 0;
		user-select: none;
	}

	.faq__question::-webkit-details-marker {
		display: none;
	}

	.faq__question:hover {
		color: var(--color-brand-primary);
	}

	.faq__question:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.faq__chevron {
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	.faq__item[open] .faq__chevron {
		transform: rotate(180deg);
	}

	.faq__answer {
		color: var(--color-text-secondary);
		margin: 0;
		padding: 0 0 var(--space-sm);
		line-height: 1.6;
	}
</style>
