<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  const hero = $derived(
    data.hero ?? {
      headline: 'Verleih & Service',
      subheadline: 'Softeis-Wagen für Ihr Event – flexibel, unkompliziert, unvergesslich.',
    },
  );
</script>

<svelte:head>
  <title>Service – Softeis Kai</title>
</svelte:head>

<Hero headline={hero.headline} subheadline={hero.subheadline} />

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  {#if data.servicesError}
    <div class="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
      <p class="text-red-700 font-medium">
        Die Serviceangebote konnten leider nicht geladen werden.
      </p>
      <p class="text-red-500 text-sm mt-1">Bitte versuchen Sie es später erneut.</p>
    </div>
  {:else if data.services.length === 0}
    <div class="rounded-2xl bg-[var(--color-brand-cream-dark)] p-12 text-center">
      <div class="text-4xl mb-4" aria-hidden="true">🚐</div>
      <p class="text-[var(--color-brand-text-muted)]">Noch keine Serviceangebote hinterlegt.</p>
    </div>
  {:else}
    <div class="mb-10">
      <h2 class="text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-2">
        Unsere Angebote
      </h2>
      <p class="text-[var(--color-brand-text-muted)]">
        Ob kleines Familienfest oder großes Firmenevent – wir haben das passende Paket.
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {#each data.services as service (service.name)}
        <ServiceCard {service} />
      {/each}
    </div>
  {/if}
</section>

<section class="bg-[var(--color-brand-text)] py-14">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-2xl font-bold text-white mb-3">Jetzt anfragen</h2>
    <p class="text-gray-400 mb-6 max-w-md mx-auto text-sm">
      Rufen Sie uns direkt an – wir besprechen gerne alle Details für Ihr Event.
    </p>
    <a
      href="tel:+4917356672 72"
      class="inline-flex items-center gap-3 rounded-full bg-[var(--color-brand-pink)] px-8 py-3 text-base font-semibold text-white hover:bg-[var(--color-brand-pink-dark)] transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      0173 – 566 72 72
    </a>
  </div>
</section>
