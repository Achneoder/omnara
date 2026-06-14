<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ActivityLog, Site } from '$lib/types';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Button from '$lib/components/Button.svelte';

  const PAGE_SIZE = 25;

  let logs = $state<ActivityLog[]>([]);
  let loading = $state(true);
  let error = $state('');
  let offset = $state(0);
  let hasMore = $state(false);
  let loadingMore = $state(false);

  let sites = $state<Site[]>([]);
  let filterSiteId = $state('');
  let filterAction = $state('');
  let filterFrom = $state('');
  let filterTo = $state('');

  let filterTimeout: ReturnType<typeof setTimeout> | null = null;

  async function load(reset = true) {
    if (reset) {
      loading = true;
      offset = 0;
      logs = [];
    } else {
      loadingMore = true;
    }
    error = '';
    try {
      const params = {
        siteId: filterSiteId || undefined,
        action: filterAction || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset,
      };
      const result = await api.activity.list(params);
      if (reset) {
        logs = result;
      } else {
        logs = [...logs, ...result];
      }
      hasMore = result.length === PAGE_SIZE;
      if (!reset) offset += result.length;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load activity.';
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  async function loadSites() {
    try {
      sites = await api.sites.list();
    } catch {
      // non-critical — filters still work without sites list
    }
  }

  async function loadMore() {
    await load(false);
  }

  function scheduleFilter() {
    if (filterTimeout) clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => load(), 400);
  }

  onMount(() => {
    loadSites();
    load();
  });
</script>

<svelte:head>
  <title>Activity — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Activity feed</h1>
    <p class="mt-1 text-sm text-gray-500">Agent and system activity across all sites.</p>
  </div>

  <div
    class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
  >
    <div class="flex flex-col gap-1">
      <label for="filter-site" class="text-xs font-medium text-gray-600">Site</label>
      <select
        id="filter-site"
        bind:value={filterSiteId}
        onchange={() => load()}
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All sites</option>
        {#each sites as site}
          <option value={site.id}>{site.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label for="filter-action" class="text-xs font-medium text-gray-600">Action</label>
      <input
        id="filter-action"
        type="text"
        bind:value={filterAction}
        oninput={scheduleFilter}
        placeholder="e.g. content.create"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="filter-from" class="text-xs font-medium text-gray-600">From</label>
      <input
        id="filter-from"
        type="date"
        bind:value={filterFrom}
        onchange={() => load()}
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="filter-to" class="text-xs font-medium text-gray-600">To</label>
      <input
        id="filter-to"
        type="date"
        bind:value={filterTo}
        onchange={() => load()}
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>

    <Button
      variant="ghost"
      size="sm"
      onclick={() => {
        filterSiteId = '';
        filterAction = '';
        filterFrom = '';
        filterTo = '';
        load();
      }}
    >
      Clear
    </Button>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={() => load()} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if logs.length === 0}
    <EmptyState title="No activity" description="No events match your current filters." />
  {:else}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Time</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Action</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Entity</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Session</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each logs as log}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td class="px-4 py-3 font-mono text-xs text-indigo-700 font-medium">{log.action}</td>
              <td class="px-4 py-3 text-gray-700">
                <span class="font-medium">{log.entityType}</span>
                {#if log.entityId}
                  <span class="ml-1 font-mono text-xs text-gray-400"
                    >{log.entityId.slice(0, 8)}</span
                  >
                {/if}
              </td>
              <td class="px-4 py-3 font-mono text-xs text-gray-400">
                {log.sessionId ? log.sessionId.slice(0, 8) : '—'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if hasMore}
      <div class="mt-6 flex justify-center">
        <Button variant="secondary" loading={loadingMore} onclick={loadMore}>Load more</Button>
      </div>
    {/if}
  {/if}
</div>
