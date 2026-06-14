<script lang="ts">
  import type { IceCreamFlavorEntry } from '$lib/types';

  interface Props {
    flavor: IceCreamFlavorEntry;
  }

  let { flavor }: Props = $props();

  const baseStyles: Record<string, string> = {
    vanilla: 'bg-brand-vanilla',
    yogurt: 'bg-brand-yogurt',
    banana: 'bg-yellow-50',
    'white-chocolate': 'bg-sky-50',
  };

  const baseInlineStyles: Record<string, string> = {
    chocolate: '#f5e6e0',
  };

  const bgClass = $derived(baseStyles[flavor.body?.base ?? ''] ?? 'bg-brand-pink-light');
  const bgInline = $derived(baseInlineStyles[flavor.body?.base ?? ''] ?? null);
</script>

<div
  class="rounded-2xl p-6 flex flex-col gap-2 shadow-sm border border-white/60 transition-transform hover:-translate-y-0.5 {bgClass}"
  style={bgInline ? `background-color: ${bgInline};` : undefined}
>
  <span class="text-2xl">🍦</span>
  <h3 class="font-semibold text-lg text-brand-chocolate leading-tight">
    {flavor.body?.name_de ?? flavor.title}
  </h3>
  {#if flavor.body?.secondary}
    <p class="text-sm text-gray-500">{flavor.body.secondary}</p>
  {/if}
  <span class="mt-auto pt-2 text-xs font-medium text-brand-pink-dark uppercase tracking-wide">
    {flavor.body?.base ?? ''}
  </span>
</div>
