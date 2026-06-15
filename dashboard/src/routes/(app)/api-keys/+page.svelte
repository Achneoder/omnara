<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ApiKey, ApiKeyCreated } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import Badge from '$lib/components/Badge.svelte';

  let keys = $state<ApiKey[]>([]);
  let loading = $state(true);
  let error = $state('');

  let showCreateModal = $state(false);
  let newLabel = $state('');
  let creating = $state(false);
  let createError = $state('');

  let createdKey = $state<ApiKeyCreated | null>(null);
  let copied = $state(false);

  async function load() {
    loading = true;
    error = '';
    try {
      keys = await api.apiKeys.list();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load API keys.';
    } finally {
      loading = false;
    }
  }

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    creating = true;
    createError = '';
    try {
      const result = await api.apiKeys.create({ label: newLabel });
      createdKey = result;
      keys = [...keys, result];
      showCreateModal = false;
      newLabel = '';
    } catch (err) {
      createError = err instanceof Error ? err.message : 'Failed to create API key.';
    } finally {
      creating = false;
    }
  }

  async function handleRevoke(key: ApiKey) {
    if (!confirm(`Revoke key "${key.label}"? This cannot be undone.`)) return;
    try {
      await api.apiKeys.revoke(key.id);
      keys = keys.map((k) => (k.id === key.id ? { ...k, revokedAt: new Date().toISOString() } : k));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to revoke key.';
    }
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  onMount(load);
</script>

<svelte:head>
  <title>API Keys — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">API Keys</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage API keys for agent access. Keys are global and can be used to manage any site or
        create new ones.
      </p>
    </div>
    <Button onclick={() => (showCreateModal = true)}>
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
      New key
    </Button>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={load} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if keys.length === 0}
    <EmptyState
      title="No API keys"
      description="Generate an API key to allow agents to authenticate with omnara."
    >
      {#snippet action()}
        <Button onclick={() => (showCreateModal = true)}>Generate key</Button>
      {/snippet}
    </EmptyState>
  {:else}
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Label</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Last used</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Created</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each keys as key}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{key.label}</td>
              <td class="px-4 py-3 text-gray-500">
                {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
              </td>
              <td class="px-4 py-3 text-gray-500">
                {new Date(key.createdAt).toLocaleDateString()}
              </td>
              <td class="px-4 py-3">
                {#if key.revokedAt}
                  <Badge variant="danger">Revoked</Badge>
                {:else}
                  <Badge variant="success">Active</Badge>
                {/if}
              </td>
              <td class="px-4 py-3 text-right">
                {#if !key.revokedAt}
                  <Button variant="danger" size="sm" onclick={() => handleRevoke(key)}>
                    Revoke
                  </Button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<Modal
  open={showCreateModal}
  title="New API key"
  onclose={() => {
    showCreateModal = false;
    createError = '';
    newLabel = '';
  }}
>
  <form onsubmit={handleCreate} id="create-key-form" class="flex flex-col gap-4">
    {#if createError}
      <ErrorAlert message={createError} />
    {/if}
    <FormField label="Label" id="key-label" required>
      <input
        id="key-label"
        type="text"
        bind:value={newLabel}
        required
        placeholder="Production agent"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </FormField>
  </form>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (showCreateModal = false)}>Cancel</Button>
    <Button type="submit" form="create-key-form" loading={creating}>Generate</Button>
  {/snippet}
</Modal>

{#if createdKey}
  <Modal open={true} title="API key generated" onclose={() => (createdKey = null)}>
    <div class="flex flex-col gap-4">
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        role="alert"
      >
        <strong>Save this key now.</strong> You won't be able to see it again after closing this dialog.
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p class="break-all font-mono text-sm text-gray-900">{createdKey.key}</p>
      </div>

      <Button onclick={copyKey} variant="secondary">
        {#if copied}
          Copied!
        {:else}
          Copy to clipboard
        {/if}
      </Button>
    </div>

    {#snippet footer()}
      <Button onclick={() => (createdKey = null)}>Done</Button>
    {/snippet}
  </Modal>
{/if}
