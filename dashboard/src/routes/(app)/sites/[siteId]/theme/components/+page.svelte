<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { ThemeComponent } from '$lib/types';
  import type { LayoutData } from '../../$types';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  let components = $state<ThemeComponent[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let deletingSlug = $state<string | null>(null);
  let deleteError = $state<string | null>(null);

  async function loadComponents() {
    loading = true;
    error = null;
    try {
      components = await api.theme.listComponents(siteId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load components.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete component "${name}"?`)) return;
    deletingSlug = slug;
    deleteError = null;
    try {
      await api.theme.deleteComponent(siteId, slug);
      components = components.filter((c) => c.slug !== slug);
    } catch (err) {
      deleteError = err instanceof Error ? err.message : 'Failed to delete component.';
    } finally {
      deletingSlug = null;
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  const categoryVariantMap: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    layout: 'default',
    hero: 'info',
    card: 'success',
    article: 'info',
    product: 'warning',
    media: 'default',
    cta: 'warning',
    nav: 'default',
    footer: 'default',
    misc: 'default',
  };

  onMount(loadComponents);
</script>

<svelte:head>
  <title>Components — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Theme components</h1>
      <p class="mt-1 text-sm text-gray-500">
        <a href="/sites/{siteId}/theme" class="text-indigo-600 hover:text-indigo-700">Theme</a>
        &rsaquo; Components
      </p>
    </div>
    <a
      href="/sites/{siteId}/theme/components/new"
      class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
    >
      New component
    </a>
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
    <ErrorAlert message={error} onretry={loadComponents} />
  {:else if components.length === 0}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <EmptyState
        title="No components"
        description="Create your first theme component to start building templates."
      >
        {#snippet action()}
          <a
            href="/sites/{siteId}/theme/components/new"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            New component
          </a>
        {/snippet}
      </EmptyState>
    </div>
  {:else}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Component
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Category
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Created
            </th>
            <th
              scope="col"
              class="px-6 py-3 w-32 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          {#each components as component (component.slug)}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">{component.name}</p>
                  <p class="text-xs text-gray-500 font-mono">{component.slug}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <Badge variant={categoryVariantMap[component.category] ?? 'default'}>
                  {component.category}
                </Badge>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-500">{formatDate(component.createdAt)}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    href="/sites/{siteId}/theme/components/{component.slug}"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </a>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deletingSlug === component.slug}
                    onclick={() => handleDelete(component.slug, component.name)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
