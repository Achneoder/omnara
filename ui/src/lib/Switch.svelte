<script lang="ts">
  interface Props {
    label?: string;
    description?: string;
    checked?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    label,
    description,
    checked = $bindable(false),
    disabled = false,
    class: className = '',
    onchange,
  }: Props = $props();
</script>

<label class="om-switch {disabled ? 'om-switch--disabled' : ''} {className}">
  <input type="checkbox" role="switch" bind:checked {disabled} {onchange} />
  <span class="om-switch__track">
    <span class="om-switch__thumb"></span>
  </span>
  {#if label || description}
    <span class="om-switch__label-text">
      {#if label}{label}{/if}
      {#if description}
        <span class="om-switch__sub">{description}</span>
      {/if}
    </span>
  {/if}
</label>

<style>
  :global(.om-switch) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    color: var(--text-body);
    user-select: none;
  }
  :global(.om-switch input) {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  :global(.om-switch__track) {
    position: relative;
    flex: 0 0 auto;
    width: 38px;
    height: 22px;
    border-radius: var(--radius-full);
    background: var(--stone-300);
    transition: background var(--duration-fast) var(--ease-standard);
  }
  :global(.om-switch__thumb) {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: var(--shadow-xs);
    transition: transform var(--duration-fast) var(--ease-out);
  }
  :global(.om-switch input:checked + .om-switch__track) {
    background: var(--accent);
  }
  :global(.om-switch input:checked + .om-switch__track .om-switch__thumb) {
    transform: translateX(16px);
  }
  :global(.om-switch input:focus-visible + .om-switch__track) {
    box-shadow: var(--shadow-focus);
  }
  :global(.om-switch--disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :global(.om-switch__label-text) {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  :global(.om-switch__sub) {
    font: var(--type-caption);
    color: var(--text-muted);
  }
</style>
