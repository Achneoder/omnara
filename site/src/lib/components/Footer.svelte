<script lang="ts">
  import type { BusinessInfo } from '$lib/api';

  interface Props {
    businessInfo: BusinessInfo | null;
  }

  const { businessInfo }: Props = $props();

  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-[var(--color-brand-text)] text-white mt-auto">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div class="sm:col-span-2">
        <div class="flex items-center gap-2 text-xl font-bold text-[var(--color-brand-pink)] mb-3">
          <span aria-hidden="true">🍦</span>
          <span>{businessInfo?.company_name ?? 'Softeis Kai'}</span>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">
          {businessInfo?.tagline ?? 'Ihr mobiler Softeis Dealer'}
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Kontakt</h3>
        {#if businessInfo}
          <address class="not-italic text-sm text-gray-300 space-y-1">
            <p>{businessInfo.street}</p>
            <p>{businessInfo.zip} {businessInfo.city}</p>
            <p class="mt-2">
              <a
                href="tel:{businessInfo.phone.replace(/\s/g, '')}"
                class="hover:text-[var(--color-brand-pink)] transition-colors"
              >
                {businessInfo.phone}
              </a>
            </p>
            <p>
              <a
                href="mailto:{businessInfo.email}"
                class="hover:text-[var(--color-brand-pink)] transition-colors"
              >
                {businessInfo.email}
              </a>
            </p>
          </address>
        {:else}
          <address class="not-italic text-sm text-gray-300 space-y-1">
            <p>Hauptstraße 25</p>
            <p>04567 Hainichen</p>
            <p class="mt-2">
              <a
                href="tel:+4917356672 72"
                class="hover:text-[var(--color-brand-pink)] transition-colors"
              >
                0173 – 566 72 72
              </a>
            </p>
          </address>
        {/if}
      </div>
    </div>

    <div
      class="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500"
    >
      <p>
        &copy; {currentYear}
        {businessInfo?.company_name ?? 'Softeis Kai'}. Alle Rechte vorbehalten.
      </p>
      <nav aria-label="Rechtliches" class="flex gap-4">
        <a href="/impressum" class="hover:text-gray-300 transition-colors">Impressum</a>
        <a href="/datenschutz" class="hover:text-gray-300 transition-colors">Datenschutz</a>
      </nav>
    </div>
  </div>
</footer>
