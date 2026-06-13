<script lang="ts">
  interface Props {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    rows?: number;
    disabled?: boolean;
    resize?: 'none' | 'vertical' | 'auto';
    id?: string;
    placeholder?: string;
    value?: string;
    class?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    label,
    hint,
    error,
    required = false,
    rows = 4,
    disabled = false,
    resize = 'vertical',
    id,
    placeholder,
    value = $bindable(''),
    class: className = '',
    oninput,
    onchange,
  }: Props = $props();

  let uid = $state(id ?? `om-ta-${Math.random().toString(36).slice(2, 7)}`);

  let textareaEl: HTMLTextAreaElement | undefined = $state();

  $effect(() => {
    if (resize === 'auto' && textareaEl) {
      textareaEl.style.height = 'auto';
      textareaEl.style.height = textareaEl.scrollHeight + 'px';
    }
  });
</script>

<div class="om-field {className}">
  {#if label}
    <label class="om-field__label" for={uid}>
      {label}
      {#if required}<span class="om-field__req">*</span>{/if}
    </label>
  {/if}
  <textarea
    bind:this={textareaEl}
    id={uid}
    class="om-textarea {error ? 'om-textarea--error' : ''} {disabled
      ? 'om-textarea--disabled'
      : ''}"
    {rows}
    {disabled}
    {placeholder}
    bind:value
    aria-invalid={!!error}
    aria-describedby={hint || error ? `${uid}-hint` : undefined}
    style:resize={resize === 'auto' ? 'none' : resize}
    {oninput}
    {onchange}
  ></textarea>
  {#if hint || error}
    <span id="{uid}-hint" class="om-field__hint {error ? 'om-field__hint--error' : ''}">
      {error ?? hint}
    </span>
  {/if}
</div>

<style>
  :global(.om-textarea) {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    color: var(--text-strong);
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    transition:
      var(--transition-colors),
      box-shadow var(--duration-fast) var(--ease-standard);
    outline: none;
    line-height: 1.6;
    box-sizing: border-box;
  }
  :global(.om-textarea::placeholder) {
    color: var(--text-faint);
  }
  :global(.om-textarea:hover) {
    border-color: var(--border-strong);
  }
  :global(.om-textarea:focus) {
    border-color: var(--border-focus);
    box-shadow: var(--shadow-focus);
  }
  :global(.om-textarea--error) {
    border-color: var(--danger);
  }
  :global(.om-textarea--error:focus) {
    box-shadow: 0 0 0 3px var(--danger-soft);
  }
  :global(.om-textarea--disabled) {
    opacity: 0.55;
    pointer-events: none;
    background: var(--bg-subtle);
  }
</style>
