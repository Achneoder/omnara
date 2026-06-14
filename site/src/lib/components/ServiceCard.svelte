<script lang="ts">
  import type { RentalService } from '$lib/api';

  interface Props {
    service: RentalService;
  }

  const { service }: Props = $props();
</script>

<article
  class="rounded-2xl bg-white border border-[var(--color-brand-cream-dark)] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4"
>
  <div class="flex items-start justify-between gap-3">
    <h3 class="text-lg font-semibold text-[var(--color-brand-text)] leading-snug">
      {service.name}
    </h3>
    {#if service.includes_staff}
      <span
        class="shrink-0 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-pink)] px-3 py-1 text-xs font-medium text-white"
      >
        <span aria-hidden="true">✓</span>
        mit Personal
      </span>
    {/if}
  </div>

  <p class="text-sm text-[var(--color-brand-text-muted)] leading-relaxed flex-1">
    {service.description}
  </p>

  {#if service.ideal_for}
    <div class="flex items-start gap-2 rounded-xl bg-[var(--color-brand-cream)] px-4 py-3">
      <span class="text-[var(--color-brand-pink-dark)] text-sm shrink-0" aria-hidden="true"
        >&#9734;</span
      >
      <div>
        <span
          class="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-text-muted)]"
          >Ideal für</span
        >
        <p class="text-sm text-[var(--color-brand-text)] mt-0.5">{service.ideal_for}</p>
      </div>
    </div>
  {/if}
</article>
