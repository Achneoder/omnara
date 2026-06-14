import { PUBLIC_API_URL, PUBLIC_SITE_ID } from '$env/static/public';
import type { Entry } from './types';

const apiUrl = PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchEntries<T = Record<string, unknown>>(type: string): Promise<Entry<T>[]> {
  const url = `${apiUrl}/public/sites/${PUBLIC_SITE_ID}/entries?type=${type}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch entries for type "${type}": ${response.statusText}`);
  }

  return response.json() as Promise<Entry<T>[]>;
}
