<script lang="ts">
  interface TabItem {
    value: string;
    label: string;
  }

  interface Props {
    items: TabItem[];
    value?: string;
    variant?: 'underline' | 'pill';
    class?: string;
    onchange?: (value: string) => void;
  }

  let {
    items,
    value = $bindable(items[0]?.value ?? ''),
    variant = 'underline',
    class: className = '',
    onchange,
  }: Props = $props();

  function select(v: string) {
    value = v;
    onchange?.(v);
  }
</script>

<div class="om-tabs om-tabs--{variant} {className}" role="tablist">
  {#each items as item (item.value)}
    <button
      role="tab"
      class="om-tab {value === item.value ? 'om-tab--active' : ''}"
      aria-selected={value === item.value}
      onclick={() => select(item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  :global(.om-tabs) {
    display: flex;
    align-items: center;
    font-family: var(--font-sans);
  }
  :global(.om-tabs--underline) {
    gap: 0;
    border-bottom: 1px solid var(--border-subtle);
  }
  :global(.om-tabs--pill) {
    gap: var(--space-1);
    background: var(--bg-subtle);
    border-radius: var(--radius-lg);
    padding: 4px;
  }
  :global(.om-tab) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: var(--transition-colors);
    white-space: nowrap;
  }
  :global(.om-tab:focus-visible) {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
  :global(.om-tabs--underline .om-tab) {
    padding: 10px 16px;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }
  :global(.om-tabs--underline .om-tab:hover) {
    color: var(--text-body);
    border-bottom-color: var(--border-strong);
  }
  :global(.om-tabs--underline .om-tab--active) {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  :global(.om-tabs--pill .om-tab) {
    padding: 6px 14px;
    border-radius: var(--radius-md);
  }
  :global(.om-tabs--pill .om-tab:hover) {
    color: var(--text-body);
  }
  :global(.om-tabs--pill .om-tab--active) {
    background: var(--surface);
    color: var(--text-strong);
    box-shadow: var(--shadow-sm);
  }
</style>
