<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    children: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  }

  let { open, title, onclose, children, footer }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="absolute inset-0 bg-black/50"
      role="button"
      tabindex="-1"
      aria-label="Close modal"
      onclick={onclose}
      onkeydown={(e) => e.key === 'Enter' && onclose()}
    ></div>
    <div class="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 id="modal-title" class="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onclick={onclose}
          class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
      <div class="px-6 py-4">
        {@render children()}
      </div>
      {#if footer}
        <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
