<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import type { LayoutData } from '../../../$types';
  import Button from '$lib/components/Button.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ComponentPreview from '$lib/components/theme/ComponentPreview.svelte';

  let { data }: { data: LayoutData } = $props();

  const siteId = $page.params.siteId;
  const componentSlug = $page.params.slug;
  const isNew = componentSlug === 'new';

  let loading = $state(!isNew);
  let loadError = $state<string | null>(null);
  let saving = $state(false);
  let saveError = $state<string | null>(null);
  let saveSuccess = $state(false);

  const CATEGORIES = [
    'layout',
    'hero',
    'card',
    'article',
    'product',
    'media',
    'cta',
    'nav',
    'footer',
    'misc',
  ] as const;

  let name = $state('');
  let category = $state<string>('misc');
  let slug = $state(isNew ? '' : componentSlug);
  let template = $state('');
  let css = $state('');

  // propsSchema as array of {placeholder, bodyKey} rows
  let schemaRows = $state<Array<{ placeholder: string; bodyKey: string }>>([]);

  function addSchemaRow() {
    schemaRows = [...schemaRows, { placeholder: '', bodyKey: '' }];
  }

  function removeSchemaRow(index: number) {
    schemaRows = schemaRows.filter((_, i) => i !== index);
  }

  function slugify(s: string): string {
    return s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async function loadComponent() {
    loading = true;
    loadError = null;
    try {
      const component = await api.theme.getComponent(siteId, componentSlug);
      name = component.name;
      category = component.category;
      slug = component.slug;
      template = component.template;
      css = component.css ?? '';
      schemaRows = Object.entries(component.propsSchema).map(([placeholder, bodyKey]) => ({
        placeholder,
        bodyKey,
      }));
    } catch (err) {
      loadError = err instanceof Error ? err.message : 'Failed to load component.';
    } finally {
      loading = false;
    }
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    saveError = null;
    saveSuccess = false;

    const propsSchema: Record<string, string> = {};
    for (const row of schemaRows) {
      if (row.placeholder.trim()) {
        propsSchema[row.placeholder.trim()] = row.bodyKey.trim();
      }
    }

    const targetSlug = isNew ? slug : componentSlug;

    const dto = {
      name,
      category,
      template,
      css: css || null,
      propsSchema,
    };

    try {
      await api.theme.upsertComponent(siteId, targetSlug, dto);
      saveSuccess = true;
      if (isNew) {
        await goto(`/sites/${siteId}/theme/components/${targetSlug}`);
      } else {
        setTimeout(() => (saveSuccess = false), 3000);
      }
    } catch (err) {
      saveError = err instanceof Error ? err.message : 'Failed to save component.';
    } finally {
      saving = false;
    }
  }

  // Preview uses the current template and css state
  let previewSlug = $derived(isNew ? slug || 'preview' : componentSlug);

  onMount(() => {
    if (!isNew) {
      loadComponent();
    }
  });
</script>

<svelte:head>
  <title>
    {isNew ? 'New component' : name || componentSlug} — {data.site.name} — omnara
  </title>
</svelte:head>

<div class="p-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">
      {isNew ? 'New component' : name || componentSlug}
    </h1>
    <p class="mt-1 text-sm text-gray-500">
      <a href="/sites/{siteId}/theme" class="text-indigo-600 hover:text-indigo-700">Theme</a>
      &rsaquo;
      <a href="/sites/{siteId}/theme/components" class="text-indigo-600 hover:text-indigo-700">
        Components
      </a>
      &rsaquo;
      {isNew ? 'New' : name || componentSlug}
    </p>
  </div>

  {#if loading}
    <div class="flex justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if loadError}
    <ErrorAlert message={loadError} onretry={loadComponent} />
  {:else}
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="space-y-6">
        {#if saveError}
          <ErrorAlert message={saveError} />
        {/if}

        {#if saveSuccess}
          <div
            class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            role="status"
          >
            Component saved successfully.
          </div>
        {/if}

        <form onsubmit={handleSave} id="component-form" class="space-y-5">
          <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-base font-semibold text-gray-900">Details</h2>
            <div class="space-y-4">
              <FormField label="Name" id="comp-name" required>
                <input
                  id="comp-name"
                  type="text"
                  bind:value={name}
                  required
                  placeholder="Hero Banner"
                  oninput={() => {
                    if (isNew && (!slug || slug === slugify(name.slice(0, -1)))) {
                      slug = slugify(name);
                    }
                  }}
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </FormField>

              {#if isNew}
                <FormField label="Slug" id="comp-slug" required>
                  <input
                    id="comp-slug"
                    type="text"
                    bind:value={slug}
                    required
                    placeholder="hero-banner"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </FormField>
              {/if}

              <FormField label="Category" id="comp-category" required>
                <select
                  id="comp-category"
                  bind:value={category}
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {#each CATEGORIES as cat (cat)}
                    <option value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  {/each}
                </select>
              </FormField>
            </div>
          </section>

          <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-base font-semibold text-gray-900">Template</h2>
            <p class="mb-3 text-xs text-gray-500">
              Use <code class="rounded bg-gray-100 px-1 py-0.5 font-mono"
                >&#123;&#123;placeholder&#125;&#125;</code
              > syntax for dynamic values.
            </p>
            <textarea
              id="comp-template"
              bind:value={template}
              rows={8}
              placeholder={'<div class="hero">\n  <h1>{{title}}</h1>\n  <p>{{body}}</p>\n</div>'}
              class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            ></textarea>
          </section>

          <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-base font-semibold text-gray-900">CSS</h2>
            <p class="mb-3 text-xs text-gray-500">
              Scoped CSS for this component. Rules will be scoped to <code
                class="rounded bg-gray-100 px-1 py-0.5 font-mono"
                >[data-component="{previewSlug}"]</code
              >.
            </p>
            <textarea
              id="comp-css"
              bind:value={css}
              rows={6}
              placeholder={'.hero { padding: 2rem; }\nh1 { font-size: 2rem; }'}
              class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            ></textarea>
          </section>

          <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-gray-900">Props schema</h2>
                <p class="mt-0.5 text-xs text-gray-500">
                  Map template placeholders to content body field keys.
                </p>
              </div>
              <Button variant="secondary" size="sm" onclick={addSchemaRow} type="button">
                Add row
              </Button>
            </div>

            {#if schemaRows.length === 0}
              <p class="text-sm text-gray-500 italic">
                No props defined. Add a row to map placeholders to body fields.
              </p>
            {:else}
              <div class="space-y-2">
                <div
                  class="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1"
                >
                  <span>Placeholder</span>
                  <span>Body key</span>
                </div>
                {#each schemaRows as row, index (index)}
                  <div class="grid grid-cols-2 gap-3 items-center">
                    <input
                      type="text"
                      bind:value={row.placeholder}
                      placeholder="title"
                      class="rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label="Placeholder name {index + 1}"
                    />
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        bind:value={row.bodyKey}
                        placeholder="title"
                        class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        aria-label="Body key {index + 1}"
                      />
                      <button
                        type="button"
                        onclick={() => removeSchemaRow(index)}
                        class="text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                        aria-label="Remove row {index + 1}"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </section>

          <div class="flex items-center justify-between">
            <a
              href="/sites/{siteId}/theme/components"
              class="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Back to components
            </a>
            <Button type="submit" form="component-form" loading={saving}>
              {isNew ? 'Create component' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>

      <div class="space-y-4">
        <div class="sticky top-8">
          <h2 class="mb-3 text-base font-semibold text-gray-900">Preview</h2>
          {#if template.trim()}
            <ComponentPreview slug={previewSlug} {template} css={css || null} />
          {:else}
            <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p class="text-sm text-gray-500">Enter a template to see a preview.</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
