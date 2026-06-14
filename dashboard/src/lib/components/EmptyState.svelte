<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    action?: import('svelte').Snippet;
  }

  let { title, description, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="rounded-full bg-gray-100 p-4 mb-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
      />
    </svg>
  </div>
  <h3 class="text-base font-semibold text-gray-900">{title}</h3>
  {#if description}
    <p class="mt-1 text-sm text-gray-500">{description}</p>
  {/if}
  {#if action}
    <div class="mt-6">
      {@render action()}
    </div>
  {/if}
</div>
