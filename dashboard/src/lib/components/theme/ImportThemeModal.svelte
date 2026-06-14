<script lang="ts">
  import { api } from '$lib/api';
  import Modal from '$lib/components/Modal.svelte';
  import Button from '$lib/components/Button.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';

  interface Props {
    siteId: string;
    open: boolean;
    onclose: () => void;
    onimported: () => void;
  }

  let { siteId, open, onclose, onimported }: Props = $props();

  let jsonInput = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleImport() {
    error = null;
    let dto: unknown;
    try {
      dto = JSON.parse(jsonInput);
    } catch {
      error = 'Invalid JSON — please check your input and try again.';
      return;
    }
    loading = true;
    try {
      await api.theme.import(siteId, dto);
      jsonInput = '';
      onimported();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Import failed.';
    } finally {
      loading = false;
    }
  }

  function handleFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      jsonInput = reader.result as string;
    };
    reader.readAsText(file);
  }

  function handleClose() {
    jsonInput = '';
    error = null;
    onclose();
  }
</script>

<Modal {open} title="Import theme" onclose={handleClose}>
  <div class="flex flex-col gap-4">
    {#if error}
      <ErrorAlert message={error} />
    {/if}

    <div>
      <label for="theme-file" class="block text-sm font-medium text-gray-700 mb-1">
        Upload JSON file
      </label>
      <input
        id="theme-file"
        type="file"
        accept=".json,application/json"
        onchange={handleFileChange}
        class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
      />
    </div>

    <div class="flex items-center gap-3">
      <div class="h-px flex-1 bg-gray-200"></div>
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">or paste JSON</span>
      <div class="h-px flex-1 bg-gray-200"></div>
    </div>

    <div>
      <label for="theme-json" class="block text-sm font-medium text-gray-700 mb-1">
        Theme JSON
      </label>
      <textarea
        id="theme-json"
        bind:value={jsonInput}
        rows={10}
        placeholder={`{\n  "theme": {\n    "name": "My Theme",\n    "version": "1.0.0",\n    "tokens": {\n      "--color-primary": "#6366f1"\n    }\n  }\n}`}
        class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
      ></textarea>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={handleClose}>Cancel</Button>
    <Button {loading} disabled={!jsonInput.trim()} onclick={handleImport}>Import theme</Button>
  {/snippet}
</Modal>
