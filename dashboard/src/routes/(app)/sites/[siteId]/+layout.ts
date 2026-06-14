import type { LayoutLoad } from './$types';
import { api } from '$lib/api';

export const load: LayoutLoad = async ({ params }) => {
  const site = await api.sites.get(params.siteId);
  return { site };
};
