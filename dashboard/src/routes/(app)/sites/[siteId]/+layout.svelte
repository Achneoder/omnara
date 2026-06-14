<script lang="ts">
  import SiteSidebar from '$lib/components/SiteSidebar.svelte';
  import type { LayoutData } from './$types';

  let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div class="flex h-full">
  <div class="w-48 shrink-0 border-r border-gray-200 bg-white">
    <SiteSidebar siteId={data.site.id} siteName={data.site.name} />
  </div>
  <div class="flex-1 overflow-y-auto">
    {@render children()}
  </div>
</div>
