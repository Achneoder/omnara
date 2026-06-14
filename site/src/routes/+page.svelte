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
      headline: 'Ihr mobiler Softeis Dealer',
      subheadline: 'Frisches Softeis für jede Gelegenheit – direkt zu Ihnen.',
    },
  );
</script>

<svelte:head>
  <title>Softeis Kai – Mobiler Softeis in Leipzig</title>
</svelte:head>

<Hero headline={hero.headline} subheadline={hero.subheadline} />

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-4">
        Unsere Spezialität
      </h2>
      <div class="space-y-3 text-[var(--color-brand-text-muted)] leading-relaxed">
        <p>
          Seit über 25 Jahren bringen wir frisches Softeis direkt zu Ihnen – auf Feste, Märkte,
          Firmenevents und Familienfeiern in der Region Leipzig.
        </p>
        <p>
          Wir setzen auf regionale Zutaten und bewährte Rezepturen, die Groß und Klein begeistern.
          16 Eissorten in cremiger Qualität – immer frisch, immer lecker.
        </p>
      </div>
      <div class="mt-6 flex flex-wrap gap-4">
        <div class="flex items-center gap-2 text-sm text-[var(--color-brand-text-muted)]">
          <span class="text-[var(--color-brand-pink-dark)]" aria-hidden="true">✓</span>
          25+ Jahre Erfahrung
        </div>
        <div class="flex items-center gap-2 text-sm text-[var(--color-brand-text-muted)]">
          <span class="text-[var(--color-brand-pink-dark)]" aria-hidden="true">✓</span>
          Regionale Zutaten
        </div>
        <div class="flex items-center gap-2 text-sm text-[var(--color-brand-text-muted)]">
          <span class="text-[var(--color-brand-pink-dark)]" aria-hidden="true">✓</span>
          16 Eissorten
        </div>
      </div>
    </div>

    <div class="bg-[var(--color-brand-pink-light)] rounded-3xl p-8 text-center">
      <div class="text-5xl mb-3" aria-hidden="true">🚐</div>
      <h3 class="text-lg font-semibold text-[var(--color-brand-text)] mb-2">Eiswagen mieten</h3>
      <p class="text-sm text-[var(--color-brand-text-muted)] mb-5">
        Mieten Sie unseren Softeis-Wagen für Ihr nächstes Event. Mit oder ohne Personal – wir machen
        es möglich.
      </p>
      <a
        href="/service"
        class="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-pink)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-pink-dark)] transition-colors"
      >
        Mehr erfahren
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</section>

{#if data.previewFlavors.length > 0}
  <section class="bg-white py-16 sm:py-20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-8 gap-4">
        <h2 class="text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)]">
          Beliebte Sorten
        </h2>
        <a
          href="/sortiment"
          class="text-sm font-medium text-[var(--color-brand-pink-dark)] hover:text-[var(--color-brand-pink)] transition-colors whitespace-nowrap"
        >
          Alle 16 Sorten &rarr;
        </a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each data.previewFlavors as flavor (flavor.name)}
          <FlavorCard {flavor} />
        {/each}
      </div>
      <div class="mt-8 text-center">
        <a
          href="/sortiment"
          class="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-brand-pink)] px-6 py-2.5 text-sm font-semibold text-[var(--color-brand-pink-dark)] hover:bg-[var(--color-brand-pink)] hover:text-white transition-colors"
        >
          Alle Eissorten entdecken
        </a>
      </div>
    </div>
  </section>
{/if}

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  <div
    class="rounded-3xl bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-sky-dark)] p-8 sm:p-12 text-white text-center"
  >
    <h2 class="text-2xl sm:text-3xl font-bold mb-3">Haben Sie Fragen?</h2>
    <p class="text-white/80 mb-6 max-w-lg mx-auto">
      Wir freuen uns über Ihre Anfrage – ob Eiswagen-Verleih, Eventplanung oder einfach nur eine
      Frage zu unseren Sorten.
    </p>
    <a
      href="/kontakt"
      class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--color-brand-sky-dark)] hover:bg-gray-50 transition-colors"
    >
      Kontakt aufnehmen
    </a>
  </div>
</section>
