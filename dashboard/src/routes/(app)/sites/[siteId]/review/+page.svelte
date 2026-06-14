<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ContentEntry } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  let entries = $state<ContentEntry[]>([]);
  let loading = $state(true);
  let error = $state('');
  let actioning = $state<Record<string, boolean>>({});

  async function load() {
    loading = true;
    error = '';
    try {
      entries = await api.entries.list(siteId, 'review');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load review queue.';
    } finally {
      loading = false;
    }
  }

  async function approve(entry: ContentEntry) {
    actioning = { ...actioning, [entry.id]: true };
    try {
      await api.entries.publish(siteId, entry.id);
      entries = entries.filter((e) => e.id !== entry.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to approve entry.';
    } finally {
      const next = { ...actioning };
      delete next[entry.id];
      actioning = next;
    }
  }

  async function reject(entry: ContentEntry) {
    if (!confirm(`Reject "${entry.title}"? It will be archived.`)) return;
    actioning = { ...actioning, [entry.id]: true };
    try {
      await api.entries.update(siteId, entry.id, { status: 'archived' });
      entries = entries.filter((e) => e.id !== entry.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to reject entry.';
    } finally {
      const next = { ...actioning };
      delete next[entry.id];
      actioning = next;
    }
  }

  onMount(load);
</script>

<svelte:head>
  <title>Review Queue — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Review queue</h1>
    <p class="mt-1 text-sm text-gray-500">
      AI-created content awaiting your approval for {data.site.name}.
    </p>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={load} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if entries.length === 0}
    <EmptyState title="Queue is empty" description="No content is waiting for review. Nice work!" />
  {:else}
    <div class="space-y-4">
      {#each entries as entry}
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-900">{entry.title}</h2>
              <p class="text-xs font-mono text-gray-400">{entry.slug}</p>
            </div>
            <p class="shrink-0 text-xs text-gray-400">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>

          {#if entry.body}
            <div
              class="mb-4 max-h-40 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
            >
              <pre class="whitespace-pre-wrap">{JSON.stringify(entry.body, null, 2)}</pre>
            </div>
          {/if}

          <div class="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={actioning[entry.id]}
              onclick={() => approve(entry)}
            >
              Approve — publish
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actioning[entry.id]}
              onclick={() => reject(entry)}
            >
              Reject — archive
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
