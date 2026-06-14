<script lang="ts">
  interface SelectOption {
    value: string;
    label: string;
  }

  interface Props {
    label?: string;
    hint?: string;
    error?: string;
    size?: 'sm' | 'md';
    options?: (string | SelectOption)[];
    disabled?: boolean;
    id?: string;
    value?: string;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    label,
    hint,
    error,
    size = 'md',
    options = [],
    disabled = false,
    id,
    value = $bindable(''),
    class: className = '',
    onchange,
  }: Props = $props();

  let uid = $state(id ?? `om-sel-${Math.random().toString(36).slice(2, 7)}`);

  function normalizeOption(opt: string | SelectOption): SelectOption {
    return typeof opt === 'string' ? { value: opt, label: opt } : opt;
  }
</script>

<div class="om-field {className}">
  {#if label}
    <label class="om-field__label" for={uid}>{label}</label>
  {/if}
  <div
    class="om-select-wrap om-select-wrap--{size} {error ? 'om-select-wrap--error' : ''} {disabled
      ? 'om-select-wrap--disabled'
      : ''}"
  >
    <select id={uid} class="om-select" {disabled} bind:value aria-invalid={!!error} {onchange}>
      {#each options.map(normalizeOption) as opt (opt.value)}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
    <span class="om-select__chevron" aria-hidden="true">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </span>
  </div>
  {#if hint || error}
    <span class="om-field__hint {error ? 'om-field__hint--error' : ''}">
      {error ?? hint}
    </span>
  {/if}
</div>

<style>
  :global(.om-select-wrap) {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    transition:
      var(--transition-colors),
      box-shadow var(--duration-fast) var(--ease-standard);
    color: var(--text-strong);
  }
  :global(.om-select-wrap:hover) {
    border-color: var(--border-strong);
  }
  :global(.om-select-wrap:focus-within) {
    border-color: var(--border-focus);
    box-shadow: var(--shadow-focus);
  }
  :global(.om-select-wrap--sm) {
    height: 32px;
    font-size: var(--text-sm);
  }
  :global(.om-select-wrap--md) {
    height: 40px;
    font-size: var(--text-base);
  }
  :global(.om-select-wrap--error) {
    border-color: var(--danger);
  }
  :global(.om-select-wrap--error:focus-within) {
    box-shadow: 0 0 0 3px var(--danger-soft);
  }
  :global(.om-select-wrap--disabled) {
    opacity: 0.55;
    pointer-events: none;
    background: var(--bg-subtle);
  }
  :global(.om-select) {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: inherit;
    padding: 0 32px 0 12px;
    height: 100%;
    appearance: none;
    cursor: pointer;
  }
  :global(.om-select__chevron) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    pointer-events: none;
    color: var(--text-muted);
  }
  :global(.om-select__chevron svg) {
    width: 16px;
    height: 16px;
  }
</style>
