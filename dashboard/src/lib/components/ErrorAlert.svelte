<script lang="ts">
  interface Props {
    message: string;
    onretry?: () => void;
  }

  let { message, onretry }: Props = $props();
</script>

<div
  role="alert"
  class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="mt-0.5 h-4 w-4 shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clip-rule="evenodd"
    />
  </svg>
  <div class="flex-1">
    <span>{message}</span>
    {#if onretry}
      <button
        onclick={onretry}
        class="ml-2 underline hover:no-underline focus-visible:outline-none"
      >
        Try again
      </button>
    {/if}
  </div>
</div>
