export const ssr = false;

import { fetchEntries } from '$lib/api';
import type { RentalServiceBody } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const serviceEntries = await fetchEntries<RentalServiceBody>('rental-service');

  const services = serviceEntries.sort(
    (a, b) => (a.body?.display_order ?? 0) - (b.body?.display_order ?? 0),
  );

  return { services };
};
