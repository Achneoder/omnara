<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Webhook, WebhookCreated, WebhookDelivery } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  const ALL_EVENT_TYPES = [
    'entry.created',
    'entry.updated',
    'entry.published',
    'entry.deleted',
    'page.published',
    'theme.imported',
  ];

  let webhooks = $state<Webhook[]>([]);
  let loading = $state(true);
  let error = $state('');

  let showCreateModal = $state(false);
  let newUrl = $state('');
  let newEventTypes = $state<string[]>([]);
  let creating = $state(false);
  let createError = $state('');

  let createdWebhook = $state<WebhookCreated | null>(null);
  let copied = $state(false);

  let selectedWebhook = $state<Webhook | null>(null);
  let deliveries = $state<WebhookDelivery[]>([]);
  let loadingDeliveries = $state(false);

  async function load() {
    loading = true;
    error = '';
    try {
      webhooks = await api.webhooks.list(siteId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load webhooks.';
    } finally {
      loading = false;
    }
  }

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    if (newEventTypes.length === 0) {
      createError = 'Select at least one event type.';
      return;
    }
    creating = true;
    createError = '';
    try {
      const result = await api.webhooks.create(siteId, {
        url: newUrl,
        eventTypes: newEventTypes,
      });
      createdWebhook = result;
      webhooks = [...webhooks, result];
      showCreateModal = false;
      newUrl = '';
      newEventTypes = [];
    } catch (err) {
      createError = err instanceof Error ? err.message : 'Failed to create webhook.';
    } finally {
      creating = false;
    }
  }

  async function handleToggleActive(webhook: Webhook) {
    try {
      const updated = await api.webhooks.update(siteId, webhook.id, {
        isActive: !webhook.isActive,
      });
      webhooks = webhooks.map((w) => (w.id === webhook.id ? updated : w));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update webhook.';
    }
  }

  async function handleDelete(webhook: Webhook) {
    if (!confirm(`Delete webhook for "${webhook.url}"? This cannot be undone.`)) return;
    try {
      await api.webhooks.delete(siteId, webhook.id);
      webhooks = webhooks.filter((w) => w.id !== webhook.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete webhook.';
    }
  }

  async function openDeliveries(webhook: Webhook) {
    selectedWebhook = webhook;
    deliveries = [];
    loadingDeliveries = true;
    try {
      deliveries = await api.webhooks.listDeliveries(siteId, webhook.id);
    } catch {
      // non-fatal
    } finally {
      loadingDeliveries = false;
    }
  }

  async function copySecret() {
    if (!createdWebhook) return;
    await navigator.clipboard.writeText(createdWebhook.plaintextSecret);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function toggleEventType(type: string) {
    if (newEventTypes.includes(type)) {
      newEventTypes = newEventTypes.filter((t) => t !== type);
    } else {
      newEventTypes = [...newEventTypes, type];
    }
  }

  onMount(load);
</script>

<svelte:head>
  <title>Webhooks — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Webhooks</h1>
      <p class="mt-1 text-sm text-gray-500">
        Notify external systems when content changes on {data.site.name}.
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
      Add webhook
    </Button>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={load} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if webhooks.length === 0}
    <EmptyState
      title="No webhooks"
      description="Add a webhook to notify external systems when content is published or updated."
    >
      {#snippet action()}
        <Button onclick={() => (showCreateModal = true)}>Add webhook</Button>
      {/snippet}
    </EmptyState>
  {:else}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">URL</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Events</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Created</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each webhooks as webhook}
            <tr class="hover:bg-gray-50">
              <td
                class="px-4 py-3 font-mono text-xs text-gray-900 max-w-xs truncate"
                title={webhook.url}
              >
                {webhook.url}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  {#each webhook.eventTypes as event}
                    <span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                      {event}
                    </span>
                  {/each}
                </div>
              </td>
              <td class="px-4 py-3">
                {#if webhook.isActive}
                  <Badge variant="success">Active</Badge>
                {:else}
                  <Badge variant="neutral">Inactive</Badge>
                {/if}
              </td>
              <td class="px-4 py-3 text-gray-500">
                {new Date(webhook.createdAt).toLocaleDateString()}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" onclick={() => openDeliveries(webhook)}>
                    History
                  </Button>
                  <Button variant="secondary" size="sm" onclick={() => handleToggleActive(webhook)}>
                    {webhook.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="danger" size="sm" onclick={() => handleDelete(webhook)}>
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

<!-- Create webhook modal -->
<Modal
  open={showCreateModal}
  title="Add webhook"
  onclose={() => {
    showCreateModal = false;
    createError = '';
    newUrl = '';
    newEventTypes = [];
  }}
>
  <form onsubmit={handleCreate} id="create-webhook-form" class="flex flex-col gap-5">
    {#if createError}
      <ErrorAlert message={createError} />
    {/if}

    <FormField label="Endpoint URL" id="webhook-url" required>
      <input
        id="webhook-url"
        type="url"
        bind:value={newUrl}
        required
        placeholder="https://example.com/webhooks/omnara"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </FormField>

    <div>
      <p class="mb-2 block text-sm font-medium text-gray-700">Events to subscribe</p>
      <div class="grid grid-cols-2 gap-2">
        {#each ALL_EVENT_TYPES as eventType}
          <label
            class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 {newEventTypes.includes(
              eventType,
            )
              ? 'border-indigo-300 bg-indigo-50'
              : ''}"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={newEventTypes.includes(eventType)}
              onchange={() => toggleEventType(eventType)}
            />
            <span class="font-mono text-xs text-gray-700">{eventType}</span>
          </label>
        {/each}
      </div>
    </div>
  </form>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (showCreateModal = false)}>Cancel</Button>
    <Button type="submit" form="create-webhook-form" loading={creating}>Create</Button>
  {/snippet}
</Modal>

<!-- Secret reveal modal -->
{#if createdWebhook}
  <Modal open={true} title="Webhook created" onclose={() => (createdWebhook = null)}>
    <div class="flex flex-col gap-4">
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        role="alert"
      >
        <strong>Save this signing secret now.</strong> It won't be shown again. Use it to verify the
        <code class="font-mono">X-Omnara-Signature</code> header on incoming requests.
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p class="break-all font-mono text-xs text-gray-900">{createdWebhook.plaintextSecret}</p>
      </div>

      <Button onclick={copySecret} variant="secondary">
        {#if copied}
          Copied!
        {:else}
          Copy to clipboard
        {/if}
      </Button>
    </div>

    {#snippet footer()}
      <Button onclick={() => (createdWebhook = null)}>Done</Button>
    {/snippet}
  </Modal>
{/if}

<!-- Delivery history modal -->
{#if selectedWebhook}
  <Modal
    open={true}
    title="Delivery history"
    onclose={() => {
      selectedWebhook = null;
      deliveries = [];
    }}
  >
    {#if loadingDeliveries}
      <LoadingSpinner />
    {:else if deliveries.length === 0}
      <p class="text-sm text-gray-500">No deliveries recorded yet.</p>
    {:else}
      <div class="max-h-96 overflow-y-auto">
        <table class="w-full text-xs">
          <thead class="sticky top-0 border-b border-gray-200 bg-white">
            <tr>
              <th class="py-2 pr-3 text-left font-medium text-gray-600">Event</th>
              <th class="py-2 pr-3 text-left font-medium text-gray-600">Status</th>
              <th class="py-2 pr-3 text-left font-medium text-gray-600">Attempts</th>
              <th class="py-2 text-left font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each deliveries as delivery}
              <tr>
                <td class="py-2 pr-3 font-mono text-gray-700">{delivery.event}</td>
                <td class="py-2 pr-3">
                  {#if delivery.success}
                    <Badge variant="success">{delivery.statusCode}</Badge>
                  {:else}
                    <Badge variant="danger">{delivery.statusCode ?? 'failed'}</Badge>
                  {/if}
                </td>
                <td class="py-2 pr-3 text-gray-500">{delivery.attempts}</td>
                <td class="py-2 text-gray-500">
                  {delivery.deliveredAt
                    ? new Date(delivery.deliveredAt).toLocaleString()
                    : new Date(delivery.createdAt).toLocaleString()}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#snippet footer()}
      <Button
        onclick={() => {
          selectedWebhook = null;
          deliveries = [];
        }}>Close</Button
      >
    {/snippet}
  </Modal>
{/if}
