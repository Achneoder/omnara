<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    iconLeft?: Snippet;
    iconRight?: Snippet;
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    fullWidth = false,
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children,
  }: Props = $props();
</script>

<button
  class="om-btn om-btn--{variant} om-btn--{size} {fullWidth ? 'om-btn--block' : ''} {loading
    ? 'om-btn--loading'
    : ''} {className}"
  {type}
  disabled={disabled || loading}
  aria-disabled={disabled || loading || undefined}
  {onclick}
>
  {#if loading}
    <span class="om-btn__spin" aria-hidden="true"></span>
  {/if}
  {#if iconLeft}
    {@render iconLeft()}
  {/if}
  <span class="om-btn__label">{@render children?.()}</span>
  {#if iconRight}
    {@render iconRight()}
  {/if}
</button>

<style>
  :global(.om-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-sans);
    font-weight: var(--weight-medium);
    line-height: 1;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    transition:
      var(--transition-colors),
      box-shadow var(--duration-fast) var(--ease-standard);
    white-space: nowrap;
    user-select: none;
    text-decoration: none;
    position: relative;
  }
  :global(.om-btn:focus-visible) {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
  :global(.om-btn[disabled], .om-btn[aria-disabled='true']) {
    opacity: 0.45;
    pointer-events: none;
  }
  :global(.om-btn svg) {
    width: 1.15em;
    height: 1.15em;
    flex: 0 0 auto;
  }
  :global(.om-btn--sm) {
    font-size: var(--text-sm);
    padding: 0 12px;
    height: 32px;
  }
  :global(.om-btn--md) {
    font-size: var(--text-base);
    padding: 0 16px;
    height: 40px;
  }
  :global(.om-btn--lg) {
    font-size: var(--text-md);
    padding: 0 22px;
    height: 48px;
  }
  :global(.om-btn--primary) {
    background: var(--accent);
    color: var(--text-on-accent);
  }
  :global(.om-btn--primary:hover) {
    background: var(--accent-hover);
  }
  :global(.om-btn--primary:active) {
    background: var(--accent-press);
  }
  :global(.om-btn--secondary) {
    background: var(--surface);
    color: var(--text-strong);
    border-color: var(--border-default);
  }
  :global(.om-btn--secondary:hover) {
    background: var(--bg-subtle);
    border-color: var(--border-strong);
  }
  :global(.om-btn--ghost) {
    background: transparent;
    color: var(--text-body);
  }
  :global(.om-btn--ghost:hover) {
    background: var(--bg-subtle);
  }
  :global(.om-btn--danger) {
    background: var(--danger);
    color: #fff;
  }
  :global(.om-btn--danger:hover) {
    background: var(--danger-hover);
  }
  :global(.om-btn--block) {
    width: 100%;
  }
  :global(.om-btn--loading .om-btn__label, .om-btn--loading svg) {
    visibility: hidden;
  }
  :global(.om-btn__spin) {
    position: absolute;
    width: 1.1em;
    height: 1.1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: om-spin 0.6s linear infinite;
  }
</style>
