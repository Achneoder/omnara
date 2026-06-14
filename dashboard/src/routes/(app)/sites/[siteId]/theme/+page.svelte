<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { SiteTheme } from '$lib/types';
  import type { LayoutData } from '../$types';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ImportThemeModal from '$lib/components/theme/ImportThemeModal.svelte';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  let theme = $state<SiteTheme | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showImportModal = $state(false);
  let deleting = $state(false);
  let deleteError = $state<string | null>(null);

  async function loadTheme() {
    loading = true;
    error = null;
    try {
      theme = await api.theme.get(siteId);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        theme = null;
      } else {
        error = err instanceof Error ? err.message : 'Failed to load theme.';
      }
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this theme? This will also remove all theme components.')) return;
    deleting = true;
    deleteError = null;
    try {
      await api.theme.delete(siteId);
      theme = null;
    } catch (err) {
      deleteError = err instanceof Error ? err.message : 'Failed to delete theme.';
    } finally {
      deleting = false;
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  onMount(loadTheme);
</script>

<svelte:head>
  <title>Theme — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Theme</h1>
      <p class="mt-1 text-sm text-gray-500">{data.site.name}</p>
    </div>
    {#if theme}
      <div class="flex items-center gap-3">
        <Button variant="secondary" onclick={() => (showImportModal = true)}>Import theme</Button>
        <Button variant="danger" loading={deleting} onclick={handleDelete}>Delete theme</Button>
      </div>
    {/if}
  </div>

  {#if deleteError}
    <div class="mb-6">
      <ErrorAlert message={deleteError} />
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if error}
    <ErrorAlert message={error} onretry={loadTheme} />
  {:else if !theme}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <EmptyState
        title="No theme configured"
        description="Import a theme to add design tokens and component templates to this site."
      >
        {#snippet action()}
          <Button onclick={() => (showImportModal = true)}>Import your first theme</Button>
        {/snippet}
      </EmptyState>
    </div>
  {:else}
    <div class="space-y-6">
      <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-semibold text-gray-900">{theme.name}</h2>
              <Badge variant="info">v{theme.version}</Badge>
            </div>
            <p class="mt-1 text-sm text-gray-500">Last updated {formatDate(theme.updatedAt)}</p>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-gray-500">Design tokens</p>
          <p class="mt-1 text-3xl font-bold text-gray-900">
            {Object.keys(theme.tokens).length}
          </p>
          <div class="mt-3">
            <a
              href="/sites/{siteId}/theme/tokens"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Edit tokens
            </a>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-gray-500">Components</p>
          <p class="mt-1 text-3xl font-bold text-gray-900">—</p>
          <div class="mt-3">
            <a
              href="/sites/{siteId}/theme/components"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Manage components
            </a>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-gray-500">Raw CSS</p>
          <p class="mt-1 text-sm font-medium text-gray-900">
            {theme.rawCss ? 'Configured' : 'Not set'}
          </p>
          <div class="mt-3">
            <a
              href="/sites/{siteId}/theme/tokens"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View tokens
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<ImportThemeModal
  {siteId}
  open={showImportModal}
  onclose={() => (showImportModal = false)}
  onimported={() => {
    showImportModal = false;
    loadTheme();
  }}
/>
