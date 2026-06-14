import { fetchBusinessInfo } from '$lib/api';
import type { LayoutLoad } from './$types';

export const prerender = false;

export const load: LayoutLoad = async () => {
  try {
    const businessInfo = await fetchBusinessInfo();
    return { businessInfo };
  } catch {
    return { businessInfo: null };
  }
};
