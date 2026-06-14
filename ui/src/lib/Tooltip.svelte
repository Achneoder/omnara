<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    kbd?: string;
    side?: 'top' | 'bottom';
    children?: Snippet;
  }

  let { label, kbd, side = 'top', children }: Props = $props();

  let shown = $state(false);
</script>

<span
  class="om-tooltip-wrap"
  onmouseenter={() => (shown = true)}
  onmouseleave={() => (shown = false)}
  onfocus={() => (shown = true)}
  onblur={() => (shown = false)}
>
  {@render children?.()}
  <span class="om-tooltip om-tooltip--{side} {shown ? 'om-tooltip--shown' : ''}" role="tooltip">
    {label}
    {#if kbd}
      <span class="om-tooltip__kbd">{kbd}</span>
    {/if}
  </span>
</span>

<style>
  :global(.om-tooltip-wrap) {
    position: relative;
    display: inline-flex;
  }
  :global(.om-tooltip) {
    position: absolute;
    z-index: var(--z-tooltip);
    pointer-events: none;
    background: var(--surface-inverse);
    color: var(--text-on-inverse);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    line-height: 1.35;
    padding: 6px 9px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    white-space: nowrap;
    opacity: 0;
    transform: translateY(2px);
    transition:
      opacity var(--duration-fast),
      transform var(--duration-fast) var(--ease-out);
  }
  :global(.om-tooltip--shown) {
    opacity: 1;
    transform: none;
  }
  :global(.om-tooltip--top) {
    bottom: calc(100% + 7px);
    left: 50%;
    translate: -50% 0;
  }
  :global(.om-tooltip--bottom) {
    top: calc(100% + 7px);
    left: 50%;
    translate: -50% 0;
  }
  :global(.om-tooltip__kbd) {
    font-family: var(--font-mono);
    opacity: 0.7;
    margin-left: 6px;
  }
</style>
