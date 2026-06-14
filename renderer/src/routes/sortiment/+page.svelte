<script lang="ts">
  import type { PageData } from './$types';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import FlavorCard from '$lib/components/FlavorCard.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const hero = $derived(data.heroes?.find((h) => h.body?.page === 'sortiment'));
</script>

<svelte:head>
  <title>Softeis Kai – Sortiment</title>
</svelte:head>

{#if hero}
  <HeroSection headline={hero.body?.headline ?? ''} subheadline={hero.body?.subheadline ?? ''} />
{:else}
  <HeroSection
    headline="Unser Sortiment"
    subheadline="16 köstliche Eissorten – für jeden Geschmack etwas dabei"
  />
{/if}

<section class="py-20 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    {#if data.flavors.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {#each data.flavors as flavor (flavor.id)}
          <FlavorCard {flavor} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-24">
        <span class="text-5xl" aria-hidden="true">🍦</span>
        <p class="mt-4 text-gray-400 text-lg">Keine Sorten verfügbar</p>
      </div>
    {/if}
  </div>
</section>
