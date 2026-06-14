import { error } from '@sveltejs/kit';
import { fetchEntry } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const siteId = import.meta.env.VITE_SITE_ID as string;

  try {
    const entry = await fetchEntry(siteId, params.slug);
    return { entry };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Entry not found';
    if (message.includes('not found')) {
      throw error(404, `No entry with slug "${params.slug}"`);
    }
    throw error(500, message);
  }
};
