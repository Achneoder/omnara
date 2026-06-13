<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    iconLeft?: Snippet;
    iconRight?: Snippet;
    prefix?: string;
    disabled?: boolean;
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    class?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    label,
    hint,
    error,
    required = false,
    size = 'md',
    iconLeft,
    iconRight,
    prefix,
    disabled = false,
    id,
    type = 'text',
    placeholder,
    value = $bindable(''),
    class: className = '',
    oninput,
    onchange,
  }: Props = $props();

  let uid = $state(id ?? `om-in-${Math.random().toString(36).slice(2, 7)}`);
</script>

<div class="om-field {className}">
  {#if label}
    <label class="om-field__label" for={uid}>
      {label}
      {#if required}<span class="om-field__req">*</span>{/if}
    </label>
  {/if}
  <div
    class="om-input om-input--{size} {error ? 'om-input--error' : ''} {disabled
      ? 'om-input--disabled'
      : ''}"
  >
    {#if iconLeft}
      <span class="om-input__affix">{@render iconLeft()}</span>
    {/if}
    {#if prefix}
      <span class="om-input__prefix">{prefix}</span>
    {/if}
    <input
      id={uid}
      {type}
      {placeholder}
      {disabled}
      bind:value
      aria-invalid={!!error}
      aria-describedby={hint || error ? `${uid}-hint` : undefined}
      {oninput}
      {onchange}
    />
    {#if iconRight}
      <span class="om-input__affix">{@render iconRight()}</span>
    {/if}
  </div>
  {#if hint || error}
    <span id="{uid}-hint" class="om-field__hint {error ? 'om-field__hint--error' : ''}">
      {error ?? hint}
    </span>
  {/if}
</div>

<style>
  :global(.om-field) {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--font-sans);
  }
  :global(.om-field__label) {
    font: var(--type-label);
    color: var(--text-strong);
    display: flex;
    gap: 6px;
    align-items: center;
  }
  :global(.om-field__req) {
    color: var(--danger);
  }
  :global(.om-field__hint) {
    font: var(--type-caption);
    color: var(--text-muted);
  }
  :global(.om-field__hint--error) {
    color: var(--danger);
  }
  :global(.om-input) {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    transition:
      var(--transition-colors),
      box-shadow var(--duration-fast) var(--ease-standard);
    color: var(--text-strong);
  }
  :global(.om-input:hover) {
    border-color: var(--border-strong);
  }
  :global(.om-input:focus-within) {
    border-color: var(--border-focus);
    box-shadow: var(--shadow-focus);
  }
  :global(.om-input--sm) {
    padding: 0 10px;
    height: 32px;
    font-size: var(--text-sm);
  }
  :global(.om-input--md) {
    padding: 0 12px;
    height: 40px;
    font-size: var(--text-base);
  }
  :global(.om-input--lg) {
    padding: 0 14px;
    height: 48px;
    font-size: var(--text-md);
  }
  :global(.om-input--error) {
    border-color: var(--danger);
  }
  :global(.om-input--error:focus-within) {
    box-shadow: 0 0 0 3px var(--danger-soft);
  }
  :global(.om-input--disabled) {
    opacity: 0.55;
    pointer-events: none;
    background: var(--bg-subtle);
  }
  :global(.om-input input) {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: inherit;
    padding: 0;
  }
  :global(.om-input input::placeholder) {
    color: var(--text-faint);
  }
  :global(.om-input__affix) {
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    font-size: 0.95em;
  }
  :global(.om-input__affix svg) {
    width: 1.05em;
    height: 1.05em;
  }
  :global(.om-input__prefix) {
    font-family: var(--font-mono);
    font-size: 0.92em;
    color: var(--text-muted);
  }
</style>
