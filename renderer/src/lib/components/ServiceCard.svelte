<script lang="ts">
  import type { RentalServiceEntry } from '$lib/types';

  interface Props {
    service: RentalServiceEntry;
  }

  let { service }: Props = $props();
</script>

<div
  class="bg-white rounded-2xl p-6 shadow-sm border border-brand-pink-light flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
>
  <div class="flex items-start justify-between gap-3">
    <h3 class="font-semibold text-lg text-brand-chocolate leading-tight">
      {service.body?.name ?? service.title}
    </h3>
    {#if service.body?.includes_staff}
      <span class="shrink-0 px-2 py-0.5 rounded-full bg-brand-pink text-white text-xs font-medium">
        Mit Personal
      </span>
    {:else}
      <span
        class="shrink-0 px-2 py-0.5 rounded-full bg-brand-cream text-brand-chocolate text-xs font-medium border border-brand-pink-light"
      >
        Selbstständig
      </span>
    {/if}
  </div>

  {#if service.body?.description}
    <p class="text-gray-600 text-sm leading-relaxed">{service.body.description}</p>
  {/if}

  {#if service.body?.ideal_for}
    <p class="text-xs text-brand-sky-dark font-medium">
      Ideal für: {service.body.ideal_for}
    </p>
  {/if}
</div>
