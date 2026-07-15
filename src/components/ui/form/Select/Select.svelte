<script lang="ts">
	import { cn } from "../../../../lib/cn";

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

<label class="ui-field">
	{#if label}
		<span class="ui-field__label">
			{label}
			{#if required}<span aria-hidden="true"> *</span>{/if}
		</span>
	{/if}
	<select
		{id}
		{name}
		{required}
		class={cn("ui-select", className, errorText && "ui-select--error")}
		{value}
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if helperText && !errorText}
		<small class="ui-field__help">{helperText}</small>
	{/if}
	{#if errorText}
		<small class="ui-field__error">{errorText}</small>
	{/if}
</label>

<style>
	.ui-field {
		display: grid;
		gap: 0.45rem;
	}
	.ui-field__label {
		font-weight: 600;
	}
	.ui-select {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-bg-primary);
		padding: 0.75rem 1rem;
		color: var(--color-text-primary);
	}
	.ui-select--error {
		border-color: #dc2626;
	}
	.ui-field__help,
	.ui-field__error {
		font-size: 0.875rem;
	}
	.ui-field__help {
		color: var(--color-text-secondary);
	}
	.ui-field__error {
		color: #dc2626;
	}
</style>
