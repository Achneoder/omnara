<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { SiteTheme } from '$lib/types';
  import type { LayoutData } from '../../$types';
  import Button from '$lib/components/Button.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  let theme = $state<SiteTheme | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let saving = $state(false);
  let saveError = $state<string | null>(null);
  let saveSuccess = $state(false);

  // Local editable copy of tokens as array of [key, value] pairs
  let tokenRows = $state<Array<{ key: string; value: string; editing: boolean }>>([]);
  let editingKey = $state<string | null>(null);
  let editingValue = $state('');

  async function loadTheme() {
    loading = true;
    error = null;
    try {
      theme = await api.theme.get(siteId);
      tokenRows = Object.entries(theme.tokens).map(([key, value]) => ({
        key,
        value,
        editing: false,
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load theme.';
    } finally {
      loading = false;
    }
  }

  function startEdit(key: string, value: string) {
    editingKey = key;
    editingValue = value;
  }

  function cancelEdit() {
    editingKey = null;
    editingValue = '';
  }

  function commitEdit(key: string) {
    tokenRows = tokenRows.map((row) => (row.key === key ? { ...row, value: editingValue } : row));
    editingKey = null;
    editingValue = '';
  }

  function handleEditKeydown(e: KeyboardEvent, key: string) {
    if (e.key === 'Enter') commitEdit(key);
    if (e.key === 'Escape') cancelEdit();
  }

  async function handleSave() {
    saving = true;
    saveError = null;
    saveSuccess = false;
    const tokens: Record<string, string> = {};
    for (const row of tokenRows) {
      tokens[row.key] = row.value;
    }
    try {
      theme = await api.theme.update(siteId, { tokens });
      tokenRows = Object.entries(theme.tokens).map(([key, value]) => ({
        key,
        value,
        editing: false,
      }));
      saveSuccess = true;
      setTimeout(() => (saveSuccess = false), 3000);
    } catch (err) {
      saveError = err instanceof Error ? err.message : 'Failed to save tokens.';
    } finally {
      saving = false;
    }
  }

  function isColorValue(value: string): boolean {
    return (
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value) ||
      /^rgb\(/.test(value) ||
      /^rgba\(/.test(value) ||
      /^hsl\(/.test(value) ||
      /^hsla\(/.test(value)
    );
  }

  onMount(loadTheme);
</script>

<svelte:head>
  <title>Tokens — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Design tokens</h1>
      <p class="mt-1 text-sm text-gray-500">
        <a href="/sites/{siteId}/theme" class="text-indigo-600 hover:text-indigo-700">Theme</a>
        &rsaquo; Tokens
      </p>
    </div>
    {#if theme}
      <Button loading={saving} onclick={handleSave}>Save tokens</Button>
    {/if}
  </div>

  {#if saveError}
    <div class="mb-6">
      <ErrorAlert message={saveError} />
    </div>
  {/if}

  {#if saveSuccess}
    <div
      class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      role="status"
    >
      Tokens saved successfully.
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
        title="No theme found"
        description="Import a theme first to manage its design tokens."
      >
        {#snippet action()}
          <a
            href="/sites/{siteId}/theme"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Go to Theme
          </a>
        {/snippet}
      </EmptyState>
    </div>
  {:else if tokenRows.length === 0}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <EmptyState title="No tokens defined" description="This theme has no design tokens yet." />
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
              Token
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Value
            </th>
            <th scope="col" class="px-6 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          {#each tokenRows as row (row.key)}
            <tr class="group">
              <td class="px-6 py-3">
                <span class="font-mono text-sm text-gray-800">{row.key}</span>
              </td>
              <td class="px-6 py-3">
                {#if editingKey === row.key}
                  <div class="flex items-center gap-2">
                    <input
                      type="text"
                      bind:value={editingValue}
                      onkeydown={(e) => handleEditKeydown(e, row.key)}
                      class="w-full rounded-md border border-indigo-400 px-2 py-1 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label="Edit token value"
                    />
                    <button
                      onclick={() => commitEdit(row.key)}
                      class="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                      aria-label="Confirm edit"
                    >
                      Save
                    </button>
                    <button
                      onclick={cancelEdit}
                      class="text-xs font-medium text-gray-500 hover:text-gray-700"
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                  </div>
                {:else}
                  <div class="flex items-center gap-2">
                    {#if isColorValue(row.value)}
                      <span
                        class="inline-block h-4 w-4 rounded-sm border border-gray-200 shrink-0"
                        style="background-color: {row.value}"
                        aria-hidden="true"
                      ></span>
                    {/if}
                    <span class="font-mono text-sm text-gray-700">{row.value}</span>
                  </div>
                {/if}
              </td>
              <td class="px-6 py-3 text-right">
                {#if editingKey !== row.key}
                  <button
                    onclick={() => startEdit(row.key, row.value)}
                    class="text-xs font-medium text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit {row.key}"
                  >
                    Edit
                  </button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
