<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import type { PageData } from './$types';
  import type { BusinessInfo } from '$lib/api';

  interface Props {
    data: PageData & { businessInfo?: BusinessInfo | null };
  }

  const { data }: Props = $props();

  const hero = $derived(
    data.hero ?? {
      headline: 'Kontakt',
      subheadline: 'Wir freuen uns auf Ihre Nachricht.',
    },
  );

  const businessInfo = $derived(data.businessInfo ?? null);
</script>

<svelte:head>
  <title>Kontakt – Softeis Kai</title>
</svelte:head>

<Hero headline={hero.headline} subheadline={hero.subheadline} />

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-[var(--color-brand-text)] mb-6">Kontaktinformationen</h2>

        <div
          class="rounded-2xl bg-white border border-[var(--color-brand-cream-dark)] p-6 space-y-5 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-10 h-10 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center text-[var(--color-brand-pink-dark)]"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-text-muted)] mb-1"
              >
                Adresse
              </p>
              <address class="not-italic text-sm text-[var(--color-brand-text)]">
                <p>{businessInfo?.street ?? 'Hauptstraße 25'}</p>
                <p>{businessInfo?.zip ?? '04567'} {businessInfo?.city ?? 'Hainichen'}</p>
              </address>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-10 h-10 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center text-[var(--color-brand-pink-dark)]"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-text-muted)] mb-1"
              >
                Telefon
              </p>
              <a
                href="tel:{(businessInfo?.phone ?? '017356672 72').replace(/\s/g, '')}"
                class="text-sm text-[var(--color-brand-pink-dark)] hover:text-[var(--color-brand-pink)] transition-colors font-medium"
              >
                {businessInfo?.phone ?? '0173 – 566 72 72'}
              </a>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-10 h-10 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center text-[var(--color-brand-pink-dark)]"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-text-muted)] mb-1"
              >
                E-Mail
              </p>
              <a
                href="mailto:{businessInfo?.email ?? 'luftballonmann@web.de'}"
                class="text-sm text-[var(--color-brand-pink-dark)] hover:text-[var(--color-brand-pink)] transition-colors font-medium"
              >
                {businessInfo?.email ?? 'luftballonmann@web.de'}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl bg-[var(--color-brand-sky)] bg-opacity-10 border border-[var(--color-brand-sky)] p-6"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl" aria-hidden="true">📍</span>
          <h3 class="font-semibold text-[var(--color-brand-text)]">Wir sind in Hainichen</h3>
        </div>
        <p class="text-sm text-[var(--color-brand-text-muted)] mb-3">
          {businessInfo?.street ?? 'Hauptstraße 25'},
          {businessInfo?.zip ?? '04567'}
          {businessInfo?.city ?? 'Hainichen'} (Region Leipzig)
        </p>
        <a
          href="https://maps.google.com/?q={encodeURIComponent(
            `${businessInfo?.street ?? 'Hauptstraße 25'}, ${businessInfo?.zip ?? '04567'} ${businessInfo?.city ?? 'Hainichen'}`,
          )}"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-[var(--color-brand-sky-dark)] hover:text-[var(--color-brand-sky)] transition-colors"
        >
          Auf Google Maps öffnen &rarr;
        </a>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-[var(--color-brand-text)] mb-6">Nachricht senden</h2>
      <form
        class="space-y-4"
        action="mailto:{businessInfo?.email ?? 'luftballonmann@web.de'}"
        method="get"
        enctype="text/plain"
      >
        <div>
          <label for="name" class="block text-sm font-medium text-[var(--color-brand-text)] mb-1.5">
            Ihr Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autocomplete="name"
            required
            class="w-full rounded-xl border border-[var(--color-brand-cream-dark)] bg-white px-4 py-2.5 text-sm text-[var(--color-brand-text)] placeholder:text-gray-400 focus:border-[var(--color-brand-pink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:ring-opacity-20 transition-colors"
            placeholder="Max Mustermann"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-[var(--color-brand-text)] mb-1.5"
          >
            Ihre E-Mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autocomplete="email"
            required
            class="w-full rounded-xl border border-[var(--color-brand-cream-dark)] bg-white px-4 py-2.5 text-sm text-[var(--color-brand-text)] placeholder:text-gray-400 focus:border-[var(--color-brand-pink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:ring-opacity-20 transition-colors"
            placeholder="max@beispiel.de"
          />
        </div>

        <div>
          <label
            for="subject"
            class="block text-sm font-medium text-[var(--color-brand-text)] mb-1.5"
          >
            Betreff
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            class="w-full rounded-xl border border-[var(--color-brand-cream-dark)] bg-white px-4 py-2.5 text-sm text-[var(--color-brand-text)] placeholder:text-gray-400 focus:border-[var(--color-brand-pink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:ring-opacity-20 transition-colors"
            placeholder="Anfrage Eiswagen-Verleih"
          />
        </div>

        <div>
          <label
            for="message"
            class="block text-sm font-medium text-[var(--color-brand-text)] mb-1.5"
          >
            Ihre Nachricht
          </label>
          <textarea
            id="message"
            name="body"
            rows="5"
            required
            class="w-full rounded-xl border border-[var(--color-brand-cream-dark)] bg-white px-4 py-2.5 text-sm text-[var(--color-brand-text)] placeholder:text-gray-400 focus:border-[var(--color-brand-pink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:ring-opacity-20 transition-colors resize-none"
            placeholder="Ich interessiere mich für..."
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-[var(--color-brand-pink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-brand-pink-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:ring-offset-2 transition-colors"
        >
          Nachricht senden
        </button>
        <p class="text-xs text-[var(--color-brand-text-muted)] text-center">
          Öffnet Ihren E-Mail-Client mit vorausgefüllter Nachricht.
        </p>
      </form>
    </div>
  </div>
</section>
