<script lang="ts">
	import { cn } from "../../../../lib/cn";
	import Field from "../Field/Field.svelte";
	import Label from "../Label/Label.svelte";

	interface Props {
		id: string;
		name: string;
		label?: string;
		rows?: number;
		helperText?: string;
		errorText?: string;
		required?: boolean;
		class?: string;
		placeholder?: string;
		value?: string;
	}

	const {
		id,
		name,
		label,
		rows = 5,
		helperText,
		errorText,
		required = false,
		class: className,
		placeholder,
		value = "",
	}: Props = $props();
</script>

<Field description={helperText} error={errorText}>
	{#if label}
		<Label for={id} {required}>{label}</Label>
	{/if}
	<textarea
		{id}
		{name}
		{rows}
		{placeholder}
		{required}
		class={cn("ui-textarea", className, errorText && "ui-textarea--error")}
		aria-invalid={errorText ? "true" : undefined}>{value}</textarea
	>
</Field>

<style>
	.ui-textarea {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-bg-primary);
		padding: 0.75rem 1rem;
		color: var(--color-text-primary);
		resize: vertical;
	}
	.ui-textarea--error {
		border-color: var(--destructive, #dc2626);
	}
</style>
