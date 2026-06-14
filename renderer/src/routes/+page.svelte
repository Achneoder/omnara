<script lang="ts">
  import type { PageData } from './$types';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import FlavorCard from '$lib/components/FlavorCard.svelte';
  import ServiceCard from '$lib/components/ServiceCard.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const hero = $derived(data.heroes?.find((h) => h.body?.page === 'home'));
  const previewFlavors = $derived(data.flavors.slice(0, 4));
</script>

<svelte:head>
  <title>Softeis Kai – Startseite</title>
</svelte:head>

<!-- Hero -->
{#if hero}
  <HeroSection
    headline={hero.body?.headline ?? ''}
    subheadline={hero.body?.subheadline ?? ''}
    ctaLabel="Alle Sorten entdecken"
    ctaHref="/sortiment"
  />
{:else}
  <HeroSection
    headline="Frisches Softeis aus Leidenschaft"
    subheadline="Entdecken Sie unsere köstlichen Eissorten"
    ctaLabel="Alle Sorten entdecken"
    ctaHref="/sortiment"
  />
{/if}

<!-- Featured Flavors -->
<section class="py-20 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-brand-chocolate">Unsere beliebtesten Sorten</h2>
      <p class="mt-3 text-gray-500 text-base">Eine kleine Auswahl unserer cremigen Spezialitäten</p>
    </div>

    {#if previewFlavors.length > 0}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each previewFlavors as flavor (flavor.id)}
          <FlavorCard {flavor} />
        {/each}
      </div>
      <div class="text-center mt-10">
        <a
          href="/sortiment"
          class="inline-block px-6 py-2.5 rounded-full border-2 border-brand-pink text-brand-pink-dark font-semibold text-sm hover:bg-brand-pink hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          Alle Sorten ansehen
        </a>
      </div>
    {:else}
      <p class="text-center text-gray-400 py-12">Keine Sorten verfügbar</p>
    {/if}
  </div>
</section>

<!-- Services -->
<section class="py-20 px-6 bg-brand-cream">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-brand-chocolate">Unser Service</h2>
      <p class="mt-3 text-gray-500 text-base">Wir kommen zu Ihnen – für jede Gelegenheit</p>
    </div>

    {#if data.services.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {#each data.services as service (service.id)}
          <ServiceCard {service} />
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-400 py-12">Keine Services verfügbar</p>
    {/if}
  </div>
</section>

<!-- Contact CTA -->
<section class="py-20 px-6 bg-gradient-to-br from-brand-pink-light to-brand-cream text-center">
  <div class="max-w-xl mx-auto flex flex-col items-center gap-6">
    <h2 class="text-3xl font-bold text-brand-chocolate">Neugierig geworden?</h2>
    <p class="text-gray-600">
      Kontaktieren Sie uns für eine unverbindliche Anfrage oder weitere Informationen.
    </p>
    <a
      href="/kontakt"
      class="px-8 py-3 rounded-full bg-brand-pink text-white font-semibold shadow-md hover:bg-brand-pink-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
    >
      Jetzt anfragen
    </a>
  </div>
</section>
