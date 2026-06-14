<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'accent';
    icon?: Snippet;
    onRemove?: () => void;
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', icon, onRemove, class: className = '', children }: Props = $props();
</script>

<span class="om-tag om-tag--{variant} {onRemove ? 'om-tag--removable' : ''} {className}">
  {#if icon}
    {@render icon()}
  {/if}
  {@render children?.()}
  {#if onRemove}
    <button type="button" class="om-tag__x" aria-label="Remove" onclick={onRemove}>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  {/if}
</span>

<style>
  :global(.om-tag) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    line-height: 1;
    padding: 4px 8px;
    border-radius: var(--radius-xs);
    background: var(--surface-inset);
    color: var(--text-body);
    border: 1px solid var(--border-subtle);
  }
  :global(.om-tag svg) {
    width: 13px;
    height: 13px;
  }
  :global(.om-tag--accent) {
    background: var(--accent-soft);
    color: var(--accent-soft-text);
    border-color: transparent;
  }
  :global(.om-tag--removable) {
    padding-right: 5px;
  }
  :global(.om-tag__x) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    border-radius: var(--radius-xs);
    opacity: 0.6;
    padding: 0;
  }
  :global(.om-tag__x:hover) {
    opacity: 1;
    background: color-mix(in oklch, currentColor 14%, transparent);
  }
</style>
