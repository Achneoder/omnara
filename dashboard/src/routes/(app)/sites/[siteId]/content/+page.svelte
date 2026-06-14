<script lang="ts">
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { ContentEntry, ContentStatus } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;

  let entries = $state<ContentEntry[]>([]);
  let loading = $state(true);
  let error = $state('');
  let statusFilter = $state<ContentStatus | ''>('');

  let editingEntry = $state<ContentEntry | null>(null);
  let editTitle = $state('');
  let editSlug = $state('');
  let editBody = $state('');
  let editStatus = $state<ContentStatus>('draft');
  let saving = $state(false);
  let saveError = $state('');

  type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
  const statusVariants: Record<ContentStatus, BadgeVariant> = {
    draft: 'default',
    review: 'warning',
    live: 'success',
    archived: 'danger',
  };

  async function load() {
    loading = true;
    error = '';
    try {
      entries = await api.entries.list(siteId, statusFilter || undefined);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load entries.';
    } finally {
      loading = false;
    }
  }

  function openEdit(entry: ContentEntry) {
    editingEntry = entry;
    editTitle = entry.title;
    editSlug = entry.slug;
    editBody = entry.body;
    editStatus = entry.status;
    saveError = '';
  }

  async function handleSaveEdit(e: SubmitEvent) {
    e.preventDefault();
    if (!editingEntry) return;
    saving = true;
    saveError = '';
    try {
      const updated = await api.entries.update(siteId, editingEntry.id, {
        title: editTitle,
        slug: editSlug,
        body: editBody,
        status: editStatus,
      });
      entries = entries.map((e) => (e.id === updated.id ? updated : e));
      editingEntry = null;
    } catch (err) {
      saveError = err instanceof Error ? err.message : 'Failed to save entry.';
    } finally {
      saving = false;
    }
  }

  async function handleDelete(entry: ContentEntry) {
    if (!confirm(`Delete "${entry.title}"?`)) return;
    try {
      await api.entries.delete(siteId, entry.id);
      entries = entries.filter((e) => e.id !== entry.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete entry.';
    }
  }

  const statuses: { value: ContentStatus | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Review' },
    { value: 'live', label: 'Live' },
    { value: 'archived', label: 'Archived' },
  ];

  $effect(() => {
    void statusFilter;
    load();
  });
</script>

<svelte:head>
  <title>Content — {data.site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Content</h1>
      <p class="mt-1 text-sm text-gray-500">{data.site.name}</p>
    </div>
    <div class="flex items-center gap-3">
      <select
        bind:value={statusFilter}
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        aria-label="Filter by status"
      >
        {#each statuses as s}
          <option value={s.value}>{s.label}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if error}
    <div class="mb-6">
      <ErrorAlert message={error} onretry={load} />
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if entries.length === 0}
    <EmptyState
      title="No entries"
      description={statusFilter
        ? `No entries with status "${statusFilter}".`
        : 'No content entries yet.'}
    />
  {:else}
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Title</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Updated</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each entries as entry}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{entry.title}</td>
              <td class="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate"
                >{entry.slug}</td
              >
              <td class="px-4 py-3">
                <Badge variant={statusVariants[entry.status]}>{entry.status}</Badge>
              </td>
              <td class="px-4 py-3 text-gray-500">
                {new Date(entry.updatedAt).toLocaleDateString()}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onclick={() => openEdit(entry)}>Edit</Button>
                  <Button variant="danger" size="sm" onclick={() => handleDelete(entry)}
                    >Delete</Button
                  >
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if editingEntry}
  <Modal open={true} title="Edit entry" onclose={() => (editingEntry = null)}>
    <form onsubmit={handleSaveEdit} id="edit-entry-form" class="flex flex-col gap-4">
      {#if saveError}
        <ErrorAlert message={saveError} />
      {/if}

      <FormField label="Title" id="edit-title" required>
        <input
          id="edit-title"
          type="text"
          bind:value={editTitle}
          required
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Slug" id="edit-slug" required>
        <input
          id="edit-slug"
          type="text"
          bind:value={editSlug}
          required
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Status" id="edit-status">
        <select
          id="edit-status"
          bind:value={editStatus}
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </FormField>

      <FormField label="Body" id="edit-body">
        <textarea
          id="edit-body"
          bind:value={editBody}
          rows="8"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        ></textarea>
      </FormField>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (editingEntry = null)}>Cancel</Button>
      <Button type="submit" form="edit-entry-form" loading={saving}>Save changes</Button>
    {/snippet}
  </Modal>
{/if}
