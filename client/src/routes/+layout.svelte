<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { initTheme } from '$lib/theme/index.js';

  let { children } = $props();

  onMount(() => {
    if (browser) {
      const siteId = import.meta.env.VITE_SITE_ID as string;
      const apiUrl = import.meta.env.VITE_API_URL as string;
      if (siteId && apiUrl) {
        initTheme(siteId, apiUrl);
      }
    }
  });
</script>

{@render children()}
