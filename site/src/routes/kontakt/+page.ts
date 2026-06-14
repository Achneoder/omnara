import { fetchHero } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  try {
    const hero = await fetchHero('kontakt');
    return { hero };
  } catch {
    return { hero: null };
  }
};
