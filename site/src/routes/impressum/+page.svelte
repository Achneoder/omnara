<script lang="ts">
  import type { BusinessInfo } from '$lib/api';

  interface Props {
    data: { businessInfo?: BusinessInfo | null };
  }

  const { data }: Props = $props();
</script>

<svelte:head>
  <title>Impressum – Softeis Kai</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-3xl font-bold text-[var(--color-brand-text)] mb-8">Impressum</h1>

  <div class="prose prose-sm text-[var(--color-brand-text-muted)] space-y-6">
    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-2">
        Angaben gemäß § 5 TMG
      </h2>
      {#if data.businessInfo}
        <address class="not-italic space-y-1">
          <p class="font-medium text-[var(--color-brand-text)]">{data.businessInfo.company_name}</p>
          <p>Inhaber: {data.businessInfo.owner}</p>
          <p>{data.businessInfo.street}</p>
          <p>{data.businessInfo.zip} {data.businessInfo.city}</p>
        </address>
      {:else}
        <address class="not-italic space-y-1">
          <p class="font-medium text-[var(--color-brand-text)]">Softeis Kai</p>
          <p>Hauptstraße 25</p>
          <p>04567 Hainichen</p>
        </address>
      {/if}
    </section>

    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-2">Kontakt</h2>
      <p>
        Telefon:
        <a
          href="tel:{(data.businessInfo?.phone ?? '017356672 72').replace(/\s/g, '')}"
          class="text-[var(--color-brand-pink-dark)] hover:underline"
        >
          {data.businessInfo?.phone ?? '0173 – 566 72 72'}
        </a>
      </p>
      <p>
        E-Mail:
        <a
          href="mailto:{data.businessInfo?.email ?? 'luftballonmann@web.de'}"
          class="text-[var(--color-brand-pink-dark)] hover:underline"
        >
          {data.businessInfo?.email ?? 'luftballonmann@web.de'}
        </a>
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-2">Haftungsausschluss</h2>
      <p>
        Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit,
        Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
      </p>
    </section>
  </div>
</div>
