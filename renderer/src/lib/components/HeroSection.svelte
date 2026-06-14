<script lang="ts">
  interface Props {
    headline: string;
    subheadline: string;
    ctaLabel?: string;
    ctaHref?: string;
  }

  let { headline, subheadline, ctaLabel, ctaHref }: Props = $props();
</script>

<section
  class="bg-gradient-to-br from-brand-pink-light via-brand-cream to-brand-vanilla py-24 px-6 text-center"
>
  <div class="max-w-3xl mx-auto flex flex-col items-center gap-6">
    <span class="text-6xl" aria-hidden="true">🍦</span>
    <h1 class="text-4xl md:text-5xl font-extrabold text-brand-chocolate leading-tight">
      {headline}
    </h1>
    <p class="text-lg md:text-xl text-gray-600 max-w-xl">
      {subheadline}
    </p>
    {#if ctaLabel && ctaHref}
      <a
        href={ctaHref}
        class="mt-2 inline-block px-8 py-3 rounded-full bg-brand-pink text-white font-semibold text-base shadow-md hover:bg-brand-pink-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
      >
        {ctaLabel}
      </a>
    {/if}
  </div>
</section>
