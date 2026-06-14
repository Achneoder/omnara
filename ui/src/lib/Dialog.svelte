<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    icon?: Snippet;
    size?: 'md' | 'lg';
    footer?: Snippet;
    onClose?: () => void;
    children?: Snippet;
  }

  let {
    open = true,
    title,
    description,
    icon,
    size = 'md',
    footer,
    onClose,
    children,
  }: Props = $props();

  function handleScrimClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="om-dialog__scrim" onclick={handleScrimClick} role="presentation">
    <div
      class="om-dialog om-dialog--{size}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'om-dialog-title' : undefined}
      aria-describedby={description ? 'om-dialog-desc' : undefined}
    >
      <div class="om-dialog__head">
        {#if icon}
          <span class="om-dialog__icon">{@render icon()}</span>
        {/if}
        <div class="om-dialog__titles">
          {#if title}
            <h2 id="om-dialog-title" class="om-dialog__title">{title}</h2>
          {/if}
          {#if description}
            <p id="om-dialog-desc" class="om-dialog__desc">{description}</p>
          {/if}
        </div>
        {#if onClose}
          <button class="om-dialog__close" aria-label="Close dialog" onclick={onClose}>
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
      </div>
      {#if children}
        <div class="om-dialog__body">
          {@render children()}
        </div>
      {/if}
      {#if footer}
        <div class="om-dialog__foot">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(.om-dialog__scrim) {
    position: fixed;
    inset: 0;
    background: rgba(26, 24, 20, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    z-index: var(--z-dialog);
  }
  :global(.om-dialog) {
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    width: 100%;
  }
  :global(.om-dialog--md) {
    max-width: 480px;
  }
  :global(.om-dialog--lg) {
    max-width: 640px;
  }
  :global(.om-dialog__head) {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-subtle);
  }
  :global(.om-dialog__icon) {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--accent-soft);
    color: var(--accent-soft-text);
  }
  :global(.om-dialog__icon svg) {
    width: 18px;
    height: 18px;
  }
  :global(.om-dialog__titles) {
    flex: 1;
    min-width: 0;
  }
  :global(.om-dialog__title) {
    font: var(--type-title);
    color: var(--text-strong);
    margin: 0 0 4px;
  }
  :global(.om-dialog__desc) {
    font: var(--type-body-sm);
    color: var(--text-muted);
    margin: 0;
  }
  :global(.om-dialog__close) {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    padding: 0;
    margin-left: auto;
  }
  :global(.om-dialog__close:hover) {
    background: var(--bg-subtle);
    color: var(--text-strong);
  }
  :global(.om-dialog__close svg) {
    width: 16px;
    height: 16px;
  }
  :global(.om-dialog__body) {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
  }
  :global(.om-dialog__foot) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--border-subtle);
  }
</style>
