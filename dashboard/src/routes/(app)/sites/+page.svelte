<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import type { Site } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import Badge from '$lib/components/Badge.svelte';

  let sites = $state<Site[]>([]);
  let loading = $state(true);
  let error = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      sites = await api.sites.list();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load sites.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(site: Site) {
    if (!confirm(`Delete "${site.name}"? This action cannot be undone.`)) return;
    try {
      await api.sites.delete(site.id);
      sites = sites.filter((s) => s.id !== site.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete site.';
    }
  }

  const platformLabels: Record<string, string> = {
    wordpress: 'WordPress',
    shopify: 'Shopify',
    custom: 'Custom',
  };

  onMount(load);
</script>

<svelte:head>
  <title>Sites — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Sites</h1>
      <p class="mt-1 text-sm text-gray-500">Manage your connected sites and platforms.</p>
    </div>
    <Button onclick={() => goto('/sites/new')}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      New site
    </Button>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={load} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner label="Loading sites..." />
  {:else if sites.length === 0}
    <EmptyState title="No sites yet" description="Add your first site to start managing content.">
      {#snippet action()}
        <Button onclick={() => goto('/sites/new')}>Add site</Button>
      {/snippet}
    </EmptyState>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each sites as site}
        <div
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h2 class="truncate text-sm font-semibold text-gray-900">{site.name}</h2>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                class="truncate text-xs text-indigo-600 hover:underline"
              >
                {site.url}
              </a>
            </div>
            <Badge variant="default">{platformLabels[site.platform] ?? site.platform}</Badge>
          </div>

          <p class="mb-4 text-xs text-gray-400">
            Added {new Date(site.createdAt).toLocaleDateString()}
          </p>

          <div class="mt-auto flex gap-2">
            <Button variant="secondary" size="sm" onclick={() => goto(`/sites/${site.id}/content`)}>
              Open
            </Button>
            <Button variant="ghost" size="sm" onclick={() => goto(`/sites/${site.id}/settings`)}>
              Settings
            </Button>
            <Button variant="danger" size="sm" onclick={() => handleDelete(site)}>Delete</Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
