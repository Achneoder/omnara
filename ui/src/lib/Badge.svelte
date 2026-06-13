<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'neutral' | 'live' | 'ai' | 'warning' | 'danger' | 'info' | 'solid';
    dot?: boolean;
    class?: string;
    children?: Snippet;
  }

  let { variant = 'neutral', dot = false, class: className = '', children }: Props = $props();
</script>

<span class="om-badge om-badge--{variant} {className}">
  {#if dot}
    <span class="om-badge__dot" aria-hidden="true"></span>
  {/if}
  {@render children?.()}
</span>

<style>
  :global(.om-badge) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-sans);
    font-weight: var(--weight-medium);
    font-size: var(--text-xs);
    line-height: 1;
    padding: 4px 9px;
    border-radius: var(--radius-full);
    border: 1px solid transparent;
    white-space: nowrap;
  }
  :global(.om-badge svg) {
    width: 13px;
    height: 13px;
  }
  :global(.om-badge__dot) {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex: 0 0 auto;
  }
  :global(.om-badge--neutral) {
    background: var(--bg-subtle);
    color: var(--text-muted);
    border-color: var(--border-subtle);
  }
  :global(.om-badge--live) {
    background: var(--success-soft);
    color: var(--success);
  }
  :global(.om-badge--ai) {
    background: var(--ai-soft);
    color: var(--ai-text);
  }
  :global(.om-badge--warning) {
    background: var(--warning-soft);
    color: var(--warning);
  }
  :global(.om-badge--danger) {
    background: var(--danger-soft);
    color: var(--danger);
  }
  :global(.om-badge--info) {
    background: var(--info-soft);
    color: var(--info);
  }
  :global(.om-badge--solid) {
    background: var(--accent);
    color: var(--text-on-accent);
  }
  :global(.om-badge--live .om-badge__dot) {
    animation: om-pulse 1.8s var(--ease-in-out) infinite;
  }
</style>
