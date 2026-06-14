<script lang="ts">
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { ContentType, Site } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  let site = $state<Site>(data.site);
  let name = $state(data.site.name);
  let url = $state(data.site.url);
  let platform = $state(data.site.platform);
  let saving = $state(false);
  let saveError = $state('');
  let saveSuccess = $state(false);

  let contentTypes = $state<ContentType[]>([]);
  let ctLoading = $state(true);
  let ctError = $state('');

  let showNewCtModal = $state(false);
  let ctName = $state('');
  let ctSlug = $state('');
  let ctSaving = $state(false);
  let ctSaveError = $state('');

  const siteId = $page.params.siteId;

  async function loadContentTypes() {
    ctLoading = true;
    ctError = '';
    try {
      contentTypes = await api.contentTypes.list(siteId);
    } catch (err) {
      ctError = err instanceof Error ? err.message : 'Failed to load content types.';
    } finally {
      ctLoading = false;
    }
  }

  async function handleSaveSettings(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    saveError = '';
    saveSuccess = false;
    try {
      site = await api.sites.update(siteId, { name, url, platform });
      saveSuccess = true;
      setTimeout(() => (saveSuccess = false), 3000);
    } catch (err) {
      saveError = err instanceof Error ? err.message : 'Failed to save settings.';
    } finally {
      saving = false;
    }
  }

  async function handleCreateContentType(e: SubmitEvent) {
    e.preventDefault();
    ctSaving = true;
    ctSaveError = '';
    try {
      const ct = await api.contentTypes.create(siteId, { name: ctName, slug: ctSlug });
      contentTypes = [...contentTypes, ct];
      showNewCtModal = false;
      ctName = '';
      ctSlug = '';
    } catch (err) {
      ctSaveError = err instanceof Error ? err.message : 'Failed to create content type.';
    } finally {
      ctSaving = false;
    }
  }

  async function handleDeleteContentType(id: string, ctName: string) {
    if (!confirm(`Delete content type "${ctName}"?`)) return;
    try {
      await api.contentTypes.delete(siteId, id);
      contentTypes = contentTypes.filter((ct) => ct.id !== id);
    } catch (err) {
      ctError = err instanceof Error ? err.message : 'Failed to delete content type.';
    }
  }

  function slugify(s: string): string {
    return s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  import { onMount } from 'svelte';
  onMount(loadContentTypes);
</script>

<svelte:head>
  <title>Settings — {site.name} — omnara</title>
</svelte:head>

<div class="p-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Site settings</h1>
    <p class="mt-1 text-sm text-gray-500">{site.name}</p>
  </div>

  <div class="space-y-8 max-w-xl">
    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-base font-semibold text-gray-900">General</h2>

      {#if saveError}
        <div class="mb-4">
          <ErrorAlert message={saveError} />
        </div>
      {/if}

      {#if saveSuccess}
        <div
          class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          Settings saved successfully.
        </div>
      {/if}

      <form onsubmit={handleSaveSettings} class="flex flex-col gap-4">
        <FormField label="Site name" id="site-name" required>
          <input
            id="site-name"
            type="text"
            bind:value={name}
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Site URL" id="site-url" required>
          <input
            id="site-url"
            type="url"
            bind:value={url}
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Platform" id="site-platform" required>
          <select
            id="site-platform"
            bind:value={platform}
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="custom">Custom</option>
            <option value="wordpress">WordPress</option>
            <option value="shopify">Shopify</option>
          </select>
        </FormField>

        <div class="pt-1">
          <Button type="submit" loading={saving}>Save settings</Button>
        </div>
      </form>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-gray-900">Content types</h2>
        <Button size="sm" onclick={() => (showNewCtModal = true)}>Add type</Button>
      </div>

      {#if ctError}
        <ErrorAlert message={ctError} onretry={loadContentTypes} />
      {:else if ctLoading}
        <LoadingSpinner size="sm" />
      {:else if contentTypes.length === 0}
        <EmptyState
          title="No content types"
          description="Define content types to structure your entries."
        />
      {:else}
        <ul class="divide-y divide-gray-100" role="list">
          {#each contentTypes as ct}
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-gray-900">{ct.name}</p>
                <p class="text-xs text-gray-500 font-mono">{ct.slug}</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onclick={() => handleDeleteContentType(ct.id, ct.name)}
              >
                Delete
              </Button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</div>

<Modal open={showNewCtModal} title="New content type" onclose={() => (showNewCtModal = false)}>
  <form onsubmit={handleCreateContentType} id="new-ct-form" class="flex flex-col gap-4">
    {#if ctSaveError}
      <ErrorAlert message={ctSaveError} />
    {/if}

    <FormField label="Name" id="ct-name" required>
      <input
        id="ct-name"
        type="text"
        bind:value={ctName}
        required
        placeholder="Blog Post"
        oninput={() => {
          if (!ctSlug || ctSlug === slugify(ctName.slice(0, -1))) {
            ctSlug = slugify(ctName);
          }
        }}
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </FormField>

    <FormField label="Slug" id="ct-slug" required>
      <input
        id="ct-slug"
        type="text"
        bind:value={ctSlug}
        required
        placeholder="blog-post"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </FormField>
  </form>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (showNewCtModal = false)}>Cancel</Button>
    <Button type="submit" form="new-ct-form" loading={ctSaving}>Create</Button>
  {/snippet}
</Modal>
