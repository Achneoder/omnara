<script lang="ts">
  interface Props {
    label: string;
    id: string;
    error?: string;
    required?: boolean;
    children: import('svelte').Snippet;
  }

  let { label, id, error, required = false, children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label for={id} class="text-sm font-medium text-gray-700">
    {label}
    {#if required}<span class="text-red-500" aria-hidden="true"> *</span>{/if}
  </label>
  {@render children()}
  {#if error}
    <p class="text-xs text-red-600" id="{id}-error" role="alert">{error}</p>
  {/if}
</div>
