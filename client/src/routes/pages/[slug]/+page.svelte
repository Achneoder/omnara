<script lang="ts">
  import type { PageData } from './$types';
  import type { ContentTypeField } from '$lib/api';
  import { renderTemplate } from '$lib/theme/render-template.js';

  let { data }: { data: PageData } = $props();

  const entry = $derived(data.entry);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Unpublished';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function fieldTag(field: ContentTypeField): 'h1' | 'h2' | 'p' {
    if (field.type === 'text') {
      if (field.name === 'headline') return 'h1';
      if (field.name === 'subheadline') return 'h2';
    }
    return 'p';
  }

  function isRichtext(field: ContentTypeField): boolean {
    return field.type === 'richtext';
  }

  function isUrl(field: ContentTypeField): boolean {
    return field.type === 'url';
  }

  function bodyValue(name: string): string {
    if (!entry.body) return '';
    const val = entry.body[name];
    return typeof val === 'string' ? val : '';
  }

  const fields = entry.contentType.fieldSchema.fields.filter(
    (f) => entry.body && f.name in entry.body,
  );
</script>

<svelte:head>
  <title>{entry.title} — omnara</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12">
  <nav class="mb-8 flex gap-2 text-sm text-zinc-500">
    <a href="/" class="hover:text-zinc-800">Home</a>
    <span>/</span>
    <a href="/pages" class="hover:text-zinc-800">Pages</a>
    <span>/</span>
    <span class="text-zinc-900">{entry.title}</span>
  </nav>

  <header class="mb-10 border-b border-zinc-200 pb-8">
    <span
      class="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
    >
      {entry.contentType.name}
    </span>
    <h1 class="mt-3 text-4xl font-bold tracking-tight text-zinc-900">{entry.title}</h1>
    <p class="mt-2 text-sm text-zinc-400">Published {formatDate(entry.publishedAt)}</p>
  </header>

  {#if entry.contentType.component && entry.body}
    <div data-component={entry.contentType.component.slug}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html renderTemplate(
        entry.contentType.component.template,
        entry.body,
        entry.contentType.component.propsSchema,
      )}
    </div>
  {:else}
    <article class="space-y-6">
      {#each fields as field (field.name)}
        {@const value = bodyValue(field.name)}
        {#if value}
          {#if isRichtext(field)}
            <div class="prose prose-zinc max-w-none leading-relaxed text-zinc-700">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html value}
            </div>
          {:else if isUrl(field)}
            <p class="text-sm text-zinc-500">
              <span class="font-medium capitalize text-zinc-700"
                >{field.name.replace(/_/g, ' ')}:
              </span>
              <a href={value} class="text-blue-600 underline hover:text-blue-800">{value}</a>
            </p>
          {:else}
            {@const tag = fieldTag(field)}
            {#if tag === 'h1'}
              <h1 class="text-3xl font-bold text-zinc-900">{value}</h1>
            {:else if tag === 'h2'}
              <h2 class="text-xl font-semibold text-zinc-700">{value}</h2>
            {:else}
              <p class="text-zinc-600">{value}</p>
            {/if}
          {/if}
        {/if}
      {/each}
    </article>
  {/if}
</main>
