<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'success' | 'info' | 'danger' | 'ai';
    title?: string;
    icon?: Snippet;
    onClose?: () => void;
    children?: Snippet;
  }

  let { variant = 'info', title, icon, onClose, children }: Props = $props();

  const defaultIcons: Record<string, string> = {
    success: '✓',
    info: 'ℹ',
    danger: '!',
    ai: '✦',
  };
</script>

<div class="om-toast om-toast--{variant}" role="alert" aria-live="assertive">
  <span class="om-toast__accent"></span>
  <span class="om-toast__icon" aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      {defaultIcons[variant]}
    {/if}
  </span>
  <div class="om-toast__body">
    {#if title}
      <span class="om-toast__title">{title}</span>
    {/if}
    {#if children}
      <span class="om-toast__msg">{@render children()}</span>
    {/if}
  </div>
  {#if onClose}
    <button class="om-toast__close" aria-label="Dismiss" onclick={onClose}>
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

<style>
  :global(.om-toast) {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-4);
    min-width: 300px;
    max-width: 420px;
    position: relative;
    overflow: hidden;
    animation: om-toast-in var(--duration-normal) var(--ease-out);
  }
  :global(.om-toast__accent) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: var(--radius-xs) 0 0 var(--radius-xs);
  }
  :global(.om-toast--success .om-toast__accent) {
    background: var(--success);
  }
  :global(.om-toast--info .om-toast__accent) {
    background: var(--info);
  }
  :global(.om-toast--danger .om-toast__accent) {
    background: var(--danger);
  }
  :global(.om-toast--ai .om-toast__accent) {
    background: var(--ai);
  }
  :global(.om-toast__icon) {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    margin-left: 6px;
  }
  :global(.om-toast--success .om-toast__icon) {
    background: var(--success-soft);
    color: var(--success);
  }
  :global(.om-toast--info .om-toast__icon) {
    background: var(--info-soft);
    color: var(--info);
  }
  :global(.om-toast--danger .om-toast__icon) {
    background: var(--danger-soft);
    color: var(--danger);
  }
  :global(.om-toast--ai .om-toast__icon) {
    background: var(--ai-soft);
    color: var(--ai);
  }
  :global(.om-toast__body) {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  :global(.om-toast__title) {
    font: var(--type-label);
    color: var(--text-strong);
    display: block;
  }
  :global(.om-toast__msg) {
    font: var(--type-caption);
    color: var(--text-muted);
    display: block;
  }
  :global(.om-toast__close) {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    padding: 0;
  }
  :global(.om-toast__close:hover) {
    background: var(--bg-subtle);
    color: var(--text-strong);
  }
  :global(.om-toast__close svg) {
    width: 14px;
    height: 14px;
  }
</style>
