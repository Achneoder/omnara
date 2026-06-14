import { fetchHero, fetchFlavors } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [hero, flavors] = await Promise.allSettled([fetchHero('sortiment'), fetchFlavors()]);

  return {
    hero: hero.status === 'fulfilled' ? hero.value : null,
    flavors: flavors.status === 'fulfilled' ? flavors.value : [],
    flavorsError: flavors.status === 'rejected',
  };
};
