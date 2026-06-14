<script lang="ts">
  interface Props {
    headline: string;
    subheadline: string;
  }

  const { headline, subheadline }: Props = $props();
</script>

<section
  class="relative overflow-hidden bg-gradient-to-br from-[var(--color-brand-pink-light)] via-[var(--color-brand-cream)] to-[var(--color-brand-cream-dark)] py-20 sm:py-28 lg:py-36"
>
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div
      class="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-[var(--color-brand-pink)] opacity-10"
    ></div>
    <div
      class="absolute bottom-0 -left-12 w-48 h-48 rounded-full bg-[var(--color-brand-sky)] opacity-10"
    ></div>
    <div
      class="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[var(--color-brand-pink-dark)] opacity-5"
    ></div>
  </div>

  <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div class="text-6xl sm:text-7xl mb-6" aria-hidden="true">🍦</div>
    <h1
      class="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-brand-text)] mb-4 leading-tight"
    >
      {headline}
    </h1>
    <p
      class="text-lg sm:text-xl text-[var(--color-brand-text-muted)] max-w-2xl mx-auto leading-relaxed"
    >
      {subheadline}
    </p>
  </div>
</section>
