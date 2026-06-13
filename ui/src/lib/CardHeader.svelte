<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    icon?: Snippet;
    action?: Snippet;
    class?: string;
    children?: Snippet;
  }

  let { title, icon, action, class: className = '', children }: Props = $props();
</script>

<div class="om-card__header {className}">
  {#if icon}
    {@render icon()}
  {/if}
  {#if title}
    <h3 class="om-card__title">{title}</h3>
  {/if}
  {@render children?.()}
  {#if action}
    <span style="margin-left: auto">{@render action()}</span>
  {/if}
</div>

<style>
  :global(.om-card__header) {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  :global(.om-card__title) {
    font: var(--type-title);
    color: var(--text-strong);
    margin: 0;
  }
</style>
