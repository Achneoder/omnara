export const ssr = false;

import { fetchEntries } from '$lib/api';
import type { IceCreamFlavorBody } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const flavorEntries = await fetchEntries<IceCreamFlavorBody>('ice-cream-flavor');

  const flavors = flavorEntries.sort(
    (a, b) => (a.body?.display_order ?? 0) - (b.body?.display_order ?? 0),
  );

  return { flavors };
};
