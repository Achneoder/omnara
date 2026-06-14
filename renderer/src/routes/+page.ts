export const ssr = false;

import { fetchEntries } from '$lib/api';
import type { IceCreamFlavorBody, RentalServiceBody } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [flavorEntries, serviceEntries] = await Promise.all([
    fetchEntries<IceCreamFlavorBody>('ice-cream-flavor'),
    fetchEntries<RentalServiceBody>('rental-service'),
  ]);

  const flavors = flavorEntries.sort(
    (a, b) => (a.body?.display_order ?? 0) - (b.body?.display_order ?? 0),
  );

  const services = serviceEntries.sort(
    (a, b) => (a.body?.display_order ?? 0) - (b.body?.display_order ?? 0),
  );

  return { flavors, services };
};
