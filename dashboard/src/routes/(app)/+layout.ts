import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth.svelte';

export const ssr = false;
export const prerender = false;

export async function load() {
  if (!browser) return {};

  if (!auth.accessToken) {
    const refreshed = await auth.refreshToken();
    if (!refreshed) {
      throw redirect(302, '/login');
    }
  }

  return {};
}
