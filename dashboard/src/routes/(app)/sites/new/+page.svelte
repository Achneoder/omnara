<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import Button from '$lib/components/Button.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';

  let name = $state('');
  let url = $state('');
  let platform = $state<'wordpress' | 'shopify' | 'custom'>('custom');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const site = await api.sites.create({ name, url, platform });
      goto(`/sites/${site.id}/content`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create site.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New site — omnara</title>
</svelte:head>

<div class="mx-auto max-w-xl p-8">
  <div class="mb-6">
    <a href="/sites" class="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to sites
    </a>
    <h1 class="text-2xl font-bold text-gray-900">New site</h1>
    <p class="mt-1 text-sm text-gray-500">Connect a new site to omnara.</p>
  </div>

  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
      {#if error}
        <ErrorAlert message={error} />
      {/if}

      <FormField label="Site name" id="name" required>
        <input
          id="name"
          type="text"
          bind:value={name}
          required
          placeholder="My Blog"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Site URL" id="url" required>
        <input
          id="url"
          type="url"
          bind:value={url}
          required
          placeholder="https://example.com"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Platform" id="platform" required>
        <select
          id="platform"
          bind:value={platform}
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="custom">Custom</option>
          <option value="wordpress">WordPress</option>
          <option value="shopify">Shopify</option>
        </select>
      </FormField>

      <div class="flex gap-3 pt-2">
        <Button type="submit" {loading}>Create site</Button>
        <Button variant="secondary" onclick={() => goto('/sites')}>Cancel</Button>
      </div>
    </form>
  </div>
</div>
