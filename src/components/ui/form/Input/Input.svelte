<script lang="ts">
	import { cn } from "../../../../lib/cn";
	import Field from "../Field/Field.svelte";
	import Label from "../Label/Label.svelte";

	interface Props {
		id: string;
		name: string;
		label?: string;
		helperText?: string;
		errorText?: string;
		required?: boolean;
		class?: string;
		type?: "text" | "email" | "tel" | "url" | "password" | "search" | "number";
		placeholder?: string;
		value?: string;
	}

	const {
		id,
		name,
		label,
		helperText,
		errorText,
		required = false,
		class: className,
		type = "text",
		placeholder,
		value,
	}: Props = $props();
</script>

<Field description={helperText} error={errorText}>
	{#if label}
		<Label for={id} {required}>{label}</Label>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{value}
		{required}
		class={cn("ui-input", className, errorText && "ui-input--error")}
		aria-invalid={errorText ? "true" : undefined}
	/>
</Field>

<style>
	.ui-input {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-bg-primary);
		padding: 0.75rem 1rem;
		color: var(--color-text-primary);
	}
	.ui-input--error {
		border-color: var(--destructive, #dc2626);
	}
</style>
