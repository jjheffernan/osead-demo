<script lang="ts">
	import Accordion from "./ui/navigation/Accordion/Accordion.svelte";

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
							// Strip markup so FAQPage JSON-LD stays plain text.
							text: item.answer.replace(/<[^>]+>/g, ""),
						},
					})),
				}
			: null,
	);

	const accordionItems = $derived(
		items.map((item, index) => ({
			value: `faq-${index}`,
			title: item.question,
			content: item.answer,
		})),
	);
</script>

<section class="faq">
	{#if title}
		<h2 class="faq__title">{title}</h2>
	{/if}
	<div class="faq__list">
		<Accordion items={accordionItems} type="single" />
	</div>
</section>

{#if schema}
	<script type="application/ld+json">{JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
{/if}

<style>
	.faq {
		padding-block: var(--space-xl);
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
</style>
