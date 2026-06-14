<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchEntries, type ContentEntry } from '$lib/api';

  const siteId = import.meta.env.VITE_SITE_ID as string;

  let entries = $state<ContentEntry[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      entries = await fetchEntries(siteId);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load entries.';
    } finally {
      loading = false;
    }
  });

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Unpublished';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
</script>

<svelte:head>
  <title>Pages — omnara</title>
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-12">
  <div class="mb-8">
    <a href="/" class="text-sm text-zinc-500 hover:text-zinc-800">← Home</a>
    <h1 class="mt-3 text-3xl font-bold tracking-tight text-zinc-900">Live Content</h1>
    <p class="mt-1 text-zinc-500">All published entries from the CMS.</p>
  </div>

  {#if loading}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each { length: 4 } as _, i (i)}
        <div class="animate-pulse rounded-xl border border-zinc-200 bg-white p-6">
          <div class="mb-3 h-4 w-20 rounded bg-zinc-200"></div>
          <div class="h-6 w-3/4 rounded bg-zinc-200"></div>
          <div class="mt-3 h-4 w-1/2 rounded bg-zinc-100"></div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
      <p class="font-medium">Failed to load entries</p>
      <p class="mt-1 text-sm">{error}</p>
    </div>
  {:else if entries.length === 0}
    <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center">
      <p class="font-medium text-zinc-600">No live entries found.</p>
      <p class="mt-1 text-sm text-zinc-400">
        Publish some content in the dashboard to see it here.
      </p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each entries as entry (entry.id)}
        <a
          href="/pages/{entry.slug}"
          class="group rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-sm"
        >
          <span
            class="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
          >
            {entry.contentType.name}
          </span>
          <h2 class="mt-3 text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
            {entry.title}
          </h2>
          <p class="mt-2 text-sm text-zinc-400">{formatDate(entry.publishedAt)}</p>
        </a>
      {/each}
    </div>
  {/if}
</main>
