export const ssr = false;

import type { PageLoad } from './$types';

// All data (businessInfo, heroes) comes from the layout load function.
// No additional fetching needed for this page.
export const load: PageLoad = async () => {
  return {};
};
