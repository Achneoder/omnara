<script lang="ts">
  import type { IceCreamFlavor } from '$lib/api';

  interface Props {
    flavor: IceCreamFlavor;
  }

  const { flavor }: Props = $props();

  const baseColors: Record<string, { bg: string; dot: string; label: string }> = {
    vanilla: {
      bg: 'bg-[var(--color-brand-vanilla)]',
      dot: 'bg-yellow-200 border-yellow-300',
      label: 'Vanille',
    },
    chocolate: {
      bg: 'bg-amber-50',
      dot: 'bg-[var(--color-brand-chocolate)] border-amber-800',
      label: 'Schokolade',
    },
    yogurt: {
      bg: 'bg-[var(--color-brand-yogurt)]',
      dot: 'bg-pink-100 border-pink-200',
      label: 'Joghurt',
    },
    strawberry: {
      bg: 'bg-red-50',
      dot: 'bg-red-300 border-red-400',
      label: 'Erdbeere',
    },
    mango: {
      bg: 'bg-orange-50',
      dot: 'bg-orange-300 border-orange-400',
      label: 'Mango',
    },
  };

  const baseKey = flavor.base?.toLowerCase() ?? '';
  const colorSet = baseColors[baseKey] ?? {
    bg: 'bg-[var(--color-brand-pink-light)]',
    dot: 'bg-[var(--color-brand-pink)] border-[var(--color-brand-pink-dark)]',
    label: flavor.base,
  };
</script>

<article
  class="group relative rounded-2xl p-5 {colorSet.bg} border border-white/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-default"
>
  <div class="flex items-start gap-3">
    <div
      class="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 {colorSet.dot}"
      aria-hidden="true"
    ></div>
    <div class="min-w-0">
      <h3 class="font-semibold text-[var(--color-brand-text)] leading-snug">
        {flavor.name_de}
      </h3>
      {#if flavor.secondary}
        <p class="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
          {colorSet.label} &middot; {flavor.secondary}
        </p>
      {:else}
        <p class="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
          {colorSet.label}
        </p>
      {/if}
    </div>
  </div>
</article>
