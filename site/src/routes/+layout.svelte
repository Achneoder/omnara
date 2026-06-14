<script lang="ts">
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { LayoutData } from './$types';

  interface Props {
    data: LayoutData;
    children: import('svelte').Snippet;
  }

  const { data, children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col bg-[var(--color-brand-cream)]">
  <Navigation />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer businessInfo={data.businessInfo ?? null} />
</div>
