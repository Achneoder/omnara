<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'ghost' | 'outline' | 'solid';
    size?: 'sm' | 'md' | 'lg';
    label: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'ghost',
    size = 'md',
    label,
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children,
  }: Props = $props();
</script>

<button
  class="om-iconbtn om-iconbtn--{variant} om-iconbtn--{size} {className}"
  aria-label={label}
  title={label}
  {type}
  {disabled}
  {onclick}
>
  {@render children?.()}
</button>

<style>
  :global(.om-iconbtn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-body);
    background: transparent;
    transition:
      var(--transition-colors),
      box-shadow var(--duration-fast) var(--ease-standard);
  }
  :global(.om-iconbtn:focus-visible) {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
  :global(.om-iconbtn[disabled], .om-iconbtn[aria-disabled='true']) {
    opacity: 0.45;
    pointer-events: none;
  }
  :global(.om-iconbtn svg) {
    width: 1.15em;
    height: 1.15em;
  }
  :global(.om-iconbtn--sm) {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  :global(.om-iconbtn--md) {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
  :global(.om-iconbtn--lg) {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  :global(.om-iconbtn--ghost:hover) {
    background: var(--bg-subtle);
    color: var(--text-strong);
  }
  :global(.om-iconbtn--outline) {
    border-color: var(--border-default);
    background: var(--surface);
  }
  :global(.om-iconbtn--outline:hover) {
    background: var(--bg-subtle);
    border-color: var(--border-strong);
  }
  :global(.om-iconbtn--solid) {
    background: var(--accent);
    color: var(--text-on-accent);
  }
  :global(.om-iconbtn--solid:hover) {
    background: var(--accent-hover);
  }
</style>
