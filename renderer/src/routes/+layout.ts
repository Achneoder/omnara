export const ssr = false;

import { fetchEntries } from '$lib/api';
import type { BusinessInfoBody, PageHeroBody } from '$lib/types';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  const [businessInfoEntries, heroEntries] = await Promise.all([
    fetchEntries<BusinessInfoBody>('business-info'),
    fetchEntries<PageHeroBody>('page-hero'),
  ]);

  return {
    businessInfo: businessInfoEntries[0] ?? null,
    heroes: heroEntries,
  };
};
