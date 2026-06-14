import { fetchHero, fetchServices } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [hero, services] = await Promise.allSettled([fetchHero('service'), fetchServices()]);

  return {
    hero: hero.status === 'fulfilled' ? hero.value : null,
    services: services.status === 'fulfilled' ? services.value : [],
    servicesError: services.status === 'rejected',
  };
};
