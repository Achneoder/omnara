<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { AssetDto } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';

  const siteId = $page.params.siteId;

  let assets = $state<AssetDto[]>([]);
  let loading = $state(true);
  let uploading = $state(false);
  let error = $state('');
  let categoryFilter = $state('');

  const categories = [
    { value: '', label: 'All' },
    { value: 'image', label: 'Images' },
    { value: 'font', label: 'Fonts' },
    { value: 'favicon', label: 'Favicons' },
    { value: 'other', label: 'Other' },
  ];

  function load() {
    loading = true;
    error = '';
    api.assets
      .list(siteId, categoryFilter || undefined)
      .then((data) => {
        assets = data;
      })
      .catch((err) => {
        error = err.message ?? 'Failed to load assets';
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(load);

  function handleCategoryChange(e: Event) {
    categoryFilter = (e.target as HTMLSelectElement).value;
    load();
  }

  async function handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    error = '';
    try {
      await api.assets.upload(siteId, file);
      input.value = '';
      load();
    } catch (err) {
      error = (err as Error).message ?? 'Upload failed';
    } finally {
      uploading = false;
    }
  }

  async function handleDelete(asset: AssetDto) {
    if (!confirm(`Delete "${asset.originalName}"?`)) return;
    try {
      await api.assets.delete(siteId, asset.id);
      assets = assets.filter((a) => a.id !== asset.id);
    } catch (err) {
      error = (err as Error).message ?? 'Delete failed';
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).catch(() => {});
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/') && mimeType !== 'image/svg+xml';
  }

  function thumbnailUrl(asset: AssetDto): string {
    if (asset.variants?.thumb) return asset.variants.thumb;
    if (asset.variants?.sm) return asset.variants.sm;
    return asset.url;
  }
</script>

<div class="p-8">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Assets</h1>
      <p class="mt-1 text-sm text-gray-500">Upload and manage images, fonts, and other files</p>
    </div>
    <div class="flex items-center gap-3">
      <select
        value={categoryFilter}
        onchange={handleCategoryChange}
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
      <input
        type="file"
        id="file-upload"
        accept="image/*,.woff,.woff2,.ttf,.otf,.eot,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.ico"
        onchange={handleUpload}
        class="hidden"
        disabled={uploading}
      />
      <label for="file-upload">
        <Button loading={uploading} variant="primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload
        </Button>
      </label>
    </div>
  </div>

  {#if error}
    <ErrorAlert message={error} onretry={load} />
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else if assets.length === 0}
    <EmptyState
      title="No assets yet"
      description="Upload images, fonts, or other files to use across your site."
    />
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each assets as asset (asset.id)}
        <div
          class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <!-- Thumbnail -->
          <div class="aspect-square bg-gray-100">
            {#if isImage(asset.mimeType)}
              <img
                src={thumbnailUrl(asset)}
                alt={asset.originalName}
                loading="lazy"
                class="h-full w-full object-cover"
              />
            {:else if asset.category === 'font'}
              <div class="flex h-full w-full items-center justify-center bg-indigo-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h6l-3 6m9-12h-2.5M18 6V4.5M18 6h-2.5M18 6v1.5M6 6h2.5M6 6v1.5M6 6V4.5M6 6h2.5"
                  />
                </svg>
              </div>
            {:else if asset.category === 'favicon'}
              <div class="flex h-full w-full items-center justify-center bg-amber-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            {:else}
              <div class="flex h-full w-full items-center justify-center bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            {/if}
          </div>

          <!-- Info -->
          <div class="p-3">
            <p class="truncate text-sm font-medium text-gray-900" title={asset.originalName}>
              {asset.originalName}
            </p>
            <p class="mt-0.5 text-xs text-gray-500">
              {formatSize(asset.size)} &middot; {asset.mimeType}
            </p>

            <!-- Action buttons -->
            <div class="mt-2 flex items-center gap-1.5">
              <button
                onclick={() => copyUrl(asset.url)}
                class="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="Copy URL"
              >
                Copy URL
              </button>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener"
                class="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="Open in new tab"
              >
                Open
              </a>
              <button
                onclick={() => handleDelete(asset)}
                class="ml-auto rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
                title="Delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
