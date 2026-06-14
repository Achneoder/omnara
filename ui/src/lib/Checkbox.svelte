<script lang="ts">
  interface Props {
    label?: string;
    description?: string;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    label,
    description,
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    class: className = '',
    onchange,
  }: Props = $props();

  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (inputEl) inputEl.indeterminate = indeterminate;
  });
</script>

<label class="om-check {disabled ? 'om-check--disabled' : ''} {className}">
  <input bind:this={inputEl} type="checkbox" bind:checked {disabled} {onchange} />
  <span class="om-check__box" aria-hidden="true">
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 8.5l3.5 3.5L13 4.5" />
    </svg>
  </span>
  {#if label || description}
    <span>
      {#if label}{label}{/if}
      {#if description}
        <span class="om-check__sub">{description}</span>
      {/if}
    </span>
  {/if}
</label>

<style>
  :global(.om-check) {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-3);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    color: var(--text-body);
    user-select: none;
  }
  :global(.om-check input) {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  :global(.om-check__box) {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border-strong);
    background: var(--surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin-top: 1px;
    transition: var(--transition-colors);
  }
  :global(.om-check__box svg) {
    width: 13px;
    height: 13px;
    opacity: 0;
    transform: scale(0.6);
    transition:
      opacity var(--duration-fast),
      transform var(--duration-fast) var(--ease-out);
  }
  :global(.om-check input:checked + .om-check__box) {
    background: var(--accent);
    border-color: var(--accent);
  }
  :global(.om-check input:checked + .om-check__box svg) {
    opacity: 1;
    transform: scale(1);
  }
  :global(.om-check input:indeterminate + .om-check__box) {
    background: var(--accent);
    border-color: var(--accent);
  }
  :global(.om-check input:focus-visible + .om-check__box) {
    box-shadow: var(--shadow-focus);
  }
  :global(.om-check--disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :global(.om-check__sub) {
    font: var(--type-caption);
    color: var(--text-muted);
    display: block;
    margin-top: 1px;
  }
</style>
