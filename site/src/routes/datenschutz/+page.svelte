<script lang="ts">
  import type { BusinessInfo } from '$lib/api';

  interface Props {
    data: { businessInfo?: BusinessInfo | null };
  }

  const { data }: Props = $props();
</script>

<svelte:head>
  <title>Datenschutz – Softeis Kai</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-3xl font-bold text-[var(--color-brand-text)] mb-8">Datenschutzerklärung</h1>

  <div class="space-y-8 text-sm text-[var(--color-brand-text-muted)] leading-relaxed">
    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-3">
        1. Datenschutz auf einen Blick
      </h2>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
        personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
        sind alle Daten, mit denen Sie persönlich identifiziert werden können.
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-3">
        2. Verantwortliche Stelle
      </h2>
      {#if data.businessInfo}
        <address class="not-italic space-y-1">
          <p class="font-medium text-[var(--color-brand-text)]">{data.businessInfo.company_name}</p>
          <p>{data.businessInfo.street}</p>
          <p>{data.businessInfo.zip} {data.businessInfo.city}</p>
          <p>E-Mail: {data.businessInfo.email}</p>
        </address>
      {:else}
        <address class="not-italic space-y-1">
          <p>Softeis Kai, Hauptstraße 25, 04567 Hainichen</p>
        </address>
      {/if}
    </section>

    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-3">
        3. Datenerfassung auf dieser Website
      </h2>
      <p>
        Diese Website erhebt keine personenbezogenen Daten über Sie, außer den technisch notwendigen
        Serverlogs Ihres Hosting-Anbieters. Es werden keine Cookies gesetzt, keine Tracking-Tools
        eingesetzt und keine Daten an Dritte weitergegeben.
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-[var(--color-brand-text)] mb-3">4. Ihre Rechte</h2>
      <p>
        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
        personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung
        sowie ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen
        zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
      </p>
    </section>
  </div>
</div>
