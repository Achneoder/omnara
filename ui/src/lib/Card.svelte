<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    elevation?: 'flat' | 'raised';
    padding?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    selected?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    elevation = 'flat',
    padding = 'md',
    interactive = false,
    selected = false,
    class: className = '',
    onclick,
    children,
  }: Props = $props();
</script>

<div
  class="om-card om-card--{elevation} om-card--pad-{padding} {interactive
    ? 'om-card--interactive'
    : ''} {selected ? 'om-card--selected' : ''} {className}"
  role={interactive ? 'button' : undefined}
  tabindex={interactive ? 0 : undefined}
  {onclick}
>
  {@render children?.()}
</div>

<style>
  :global(.om-card) {
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    color: var(--text-body);
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      box-shadow var(--duration-fast) var(--ease-standard),
      transform var(--duration-fast) var(--ease-out);
  }
  :global(.om-card--flat) {
    box-shadow: none;
  }
  :global(.om-card--raised) {
    box-shadow: var(--shadow-sm);
  }
  :global(.om-card--pad-sm) {
    padding: var(--space-4);
  }
  :global(.om-card--pad-md) {
    padding: var(--space-6);
  }
  :global(.om-card--pad-lg) {
    padding: var(--space-7);
  }
  :global(.om-card--interactive) {
    cursor: pointer;
  }
  :global(.om-card--interactive:hover) {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-md);
  }
  :global(.om-card--interactive:active) {
    transform: translateY(1px);
  }
  :global(.om-card--selected) {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
</style>
