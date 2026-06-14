import { fetchHero, fetchFlavors } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [hero, allFlavors] = await Promise.allSettled([fetchHero('home'), fetchFlavors()]);

  return {
    hero: hero.status === 'fulfilled' ? hero.value : null,
    previewFlavors: allFlavors.status === 'fulfilled' ? allFlavors.value.slice(0, 4) : [],
  };
};
