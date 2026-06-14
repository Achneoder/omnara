<script lang="ts">
  import type { PageData } from './$types';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import ServiceCard from '$lib/components/ServiceCard.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const hero = $derived(data.heroes?.find((h) => h.body?.page === 'service'));
</script>

<svelte:head>
  <title>Softeis Kai – Service</title>
</svelte:head>

{#if hero}
  <HeroSection headline={hero.body?.headline ?? ''} subheadline={hero.body?.subheadline ?? ''} />
{:else}
  <HeroSection
    headline="Unser Verleihservice"
    subheadline="Softeis-Erlebnisse für jede Veranstaltung – wir bringen das Eis zu Ihnen"
  />
{/if}

<section class="py-20 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    {#if data.services.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each data.services as service (service.id)}
          <ServiceCard {service} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-24">
        <p class="text-gray-400 text-lg">Keine Services verfügbar</p>
      </div>
    {/if}
  </div>
</section>

<!-- CTA -->
<section class="py-16 px-6 bg-brand-cream text-center">
  <div class="max-w-xl mx-auto flex flex-col items-center gap-5">
    <h2 class="text-2xl font-bold text-brand-chocolate">Interesse geweckt?</h2>
    <p class="text-gray-600">
      Schreiben Sie uns – wir erstellen Ihnen gerne ein individuelles Angebot.
    </p>
    <a
      href="/kontakt"
      class="px-8 py-3 rounded-full bg-brand-pink text-white font-semibold shadow-md hover:bg-brand-pink-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
    >
      Jetzt anfragen
    </a>
  </div>
</section>
