<script lang="ts">
  interface Props {
    slug: string;
    template: string;
    css: string | null;
  }

  let { slug, template, css }: Props = $props();

  let previewHtml = $derived(
    template.replace(
      /\{\{(\w+)\}\}/g,
      (_, name) => `<span class="preview-placeholder">${name}</span>`,
    ),
  );
</script>

<div class="preview-wrapper rounded-lg border border-gray-200 bg-white overflow-auto p-4 min-h-24">
  {#if css}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<style>[data-component="${slug}"] { ${css} } .preview-placeholder { background: #e5e7eb; border-radius: 3px; padding: 0 4px; font-style: italic; color: #6b7280; font-size: 0.75em; }</style>`}
  {:else}
    <style>
      .preview-placeholder {
        background: #e5e7eb;
        border-radius: 3px;
        padding: 0 4px;
        font-style: italic;
        color: #6b7280;
        font-size: 0.75em;
      }
    </style>
  {/if}
  <div data-component={slug}>
    <!-- Template HTML is operator-entered in this same session; placeholder names are \w+ alphanumeric only -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html previewHtml}
  </div>
</div>
