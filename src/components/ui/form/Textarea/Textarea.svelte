<script lang="ts">
	import { cn } from "../../../../lib/cn";

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

<label class="ui-field">
	{#if label}
		<span class="ui-field__label">
			{label}
			{#if required}<span aria-hidden="true"> *</span>{/if}
		</span>
	{/if}
	<textarea
		{id}
		{name}
		{rows}
		{placeholder}
		{required}
		class={cn("ui-textarea", className, errorText && "ui-textarea--error")}
		>{value}</textarea
	>
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
