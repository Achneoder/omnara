<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import FlavorCard from '$lib/components/FlavorCard.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  const hero = $derived(
    data.hero ?? {
      headline: 'Unsere Eissorten',
      subheadline: '16 cremige Sorten – für jeden Geschmack das Richtige.',
    },
  );
</script>

<svelte:head>
  <title>Sortiment – Softeis Kai</title>
</svelte:head>

<Hero headline={hero.headline} subheadline={hero.subheadline} />

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  {#if data.flavorsError}
    <div class="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
      <p class="text-red-700 font-medium">Die Eissorten konnten leider nicht geladen werden.</p>
      <p class="text-red-500 text-sm mt-1">Bitte versuchen Sie es später erneut.</p>
    </div>
  {:else if data.flavors.length === 0}
    <div class="rounded-2xl bg-[var(--color-brand-cream-dark)] p-12 text-center">
      <div class="text-4xl mb-4" aria-hidden="true">🍦</div>
      <p class="text-[var(--color-brand-text-muted)]">Noch keine Eissorten hinterlegt.</p>
    </div>
  {:else}
    <div class="mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-2">
        Alle {data.flavors.length} Sorten
      </h2>
      <p class="text-[var(--color-brand-text-muted)]">
        Frisch zubereitet aus regionalen Zutaten – immer cremig, immer lecker.
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each data.flavors as flavor (flavor.name)}
        <FlavorCard {flavor} />
      {/each}
    </div>
  {/if}
</section>

<section class="bg-[var(--color-brand-pink-light)] py-12">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-xl font-bold text-[var(--color-brand-text)] mb-2">
      Eine bestimmte Sorte gewünscht?
    </h2>
    <p class="text-[var(--color-brand-text-muted)] mb-5 text-sm">
      Sprechen Sie uns gerne an – wir freuen uns auf Ihre Anfrage.
    </p>
    <a
      href="/kontakt"
      class="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-pink)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-pink-dark)] transition-colors"
    >
      Jetzt anfragen
    </a>
  </div>
</section>
