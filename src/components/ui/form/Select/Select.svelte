<script lang="ts">
	import { cn } from "../../../../lib/cn";
	import Field from "../Field/Field.svelte";
	import Label from "../Label/Label.svelte";

	export interface Option {
		label: string;
		value: string;
	}

	interface Props {
		id: string;
		name: string;
		label?: string;
		options: Option[];
		helperText?: string;
		errorText?: string;
		required?: boolean;
		class?: string;
		value?: string;
	}

	const {
		id,
		name,
		label,
		options,
		helperText,
		errorText,
		required = false,
		class: className,
		value,
	}: Props = $props();
</script>

<Field description={helperText} error={errorText}>
	{#if label}
		<Label for={id} {required}>{label}</Label>
	{/if}
	<select
		{id}
		{name}
		{required}
		class={cn("ui-select", className, errorText && "ui-select--error")}
		{value}
		aria-invalid={errorText ? "true" : undefined}
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</Field>

<style>
	.ui-select {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-bg-primary);
		padding: 0.75rem 1rem;
		color: var(--color-text-primary);
	}
	.ui-select--error {
		border-color: var(--destructive, #dc2626);
	}
</style>
