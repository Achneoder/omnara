<script lang="ts">
  import type { PageData } from './$types';
  import HeroSection from '$lib/components/HeroSection.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const hero = $derived(data.heroes?.find((h) => h.body?.page === 'kontakt'));
  const info = $derived(data.businessInfo?.body ?? null);

  let name = $state('');
  let email = $state('');
  let message = $state('');

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!info?.email) return;

    const subject = encodeURIComponent(`Anfrage von ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${message}`);
    window.location.href = `mailto:${info.email}?subject=${subject}&body=${body}`;
  }
</script>

<svelte:head>
  <title>Softeis Kai – Kontakt</title>
</svelte:head>

{#if hero}
  <HeroSection headline={hero.body?.headline ?? ''} subheadline={hero.body?.subheadline ?? ''} />
{:else}
  <HeroSection headline="Kontakt" subheadline="Wir freuen uns auf Ihre Nachricht" />
{/if}

<section class="py-20 px-6 bg-white">
  <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
    <!-- Contact info -->
    <div>
      <h2 class="text-2xl font-bold text-brand-chocolate mb-6">Unsere Kontaktdaten</h2>

      {#if info}
        <dl class="space-y-5 text-gray-700">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-brand-pink-dark mb-1">
              Inhaber
            </dt>
            <dd class="font-medium">{info.owner}</dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-brand-pink-dark mb-1">
              Adresse
            </dt>
            <dd>
              <address class="not-italic">
                <span class="block">{info.street}</span>
                <span class="block">{info.zip} {info.city}</span>
              </address>
            </dd>
          </div>

          {#if info.phone}
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-brand-pink-dark mb-1">
                Telefon
              </dt>
              <dd>
                <a
                  href="tel:{info.phone}"
                  class="font-medium text-brand-sky-dark hover:text-brand-chocolate transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {info.phone}
                </a>
              </dd>
            </div>
          {/if}

          {#if info.email}
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-brand-pink-dark mb-1">
                E-Mail
              </dt>
              <dd>
                <a
                  href="mailto:{info.email}"
                  class="font-medium text-brand-sky-dark hover:text-brand-chocolate transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {info.email}
                </a>
              </dd>
            </div>
          {/if}
        </dl>
      {:else}
        <p class="text-gray-400">Kontaktinformationen werden geladen…</p>
      {/if}
    </div>

    <!-- Contact form -->
    <div>
      <h2 class="text-2xl font-bold text-brand-chocolate mb-6">Nachricht schreiben</h2>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-1">
            Name <span class="text-brand-pink" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            bind:value={name}
            required
            autocomplete="name"
            placeholder="Ihr Name"
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition"
          />
        </div>

        <div>
          <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-1">
            E-Mail <span class="text-brand-pink" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            bind:value={email}
            required
            autocomplete="email"
            placeholder="ihre@email.de"
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition"
          />
        </div>

        <div>
          <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-1">
            Nachricht <span class="text-brand-pink" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            bind:value={message}
            required
            rows={5}
            placeholder="Ihre Nachricht…"
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-full bg-brand-pink text-white font-semibold shadow-md hover:bg-brand-pink-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name || !email || !message}
        >
          Nachricht senden
        </button>

        <p class="text-xs text-gray-400 text-center">
          Öffnet Ihr E-Mail-Programm mit vorausgefüllter Nachricht.
        </p>
      </form>
    </div>
  </div>
</section>
