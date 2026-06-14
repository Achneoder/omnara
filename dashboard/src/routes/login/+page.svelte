<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte';
  import Button from '$lib/components/Button.svelte';
  import FormField from '$lib/components/FormField.svelte';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      await auth.login(email, password);
      goto('/sites');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign in — omnara</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
        <span class="text-sm font-bold text-white">O</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">omnara</h1>
      <p class="mt-1 text-sm text-gray-500">Sign in to your dashboard</p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <form onsubmit={handleSubmit} class="flex flex-col gap-4" novalidate>
        {#if error}
          <div
            role="alert"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        {/if}

        <FormField label="Email" id="email" required>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Password" id="password" required>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <Button type="submit" {loading} variant="primary" size="md">Sign in</Button>
      </form>
    </div>
  </div>
</div>
