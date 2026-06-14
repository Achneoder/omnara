const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const SITE_ID = import.meta.env.VITE_SITE_ID ?? '';

export interface ContentEntry<T = Record<string, unknown>> {
  id: string;
  title: string;
  slug: string;
  body: T;
  contentType: { id: string; name: string; slug: string };
  publishedAt: string | null;
}

export interface BusinessInfo {
  company_name: string;
  owner: string;
  street: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  founding_year: number;
  tagline: string;
  description: string;
}

export interface IceCreamFlavor {
  name: string;
  name_de: string;
  base: string;
  secondary?: string;
  display_order: number;
}

export interface RentalService {
  name: string;
  description: string;
  ideal_for: string;
  includes_staff: boolean;
  display_order: number;
}

export interface PageHero {
  page: string;
  headline: string;
  subheadline: string;
}

export async function fetchEntries<T = Record<string, unknown>>(
  typeSlug?: string,
): Promise<ContentEntry<T>[]> {
  const url = new URL(`/public/sites/${SITE_ID}/entries`, API_URL);
  if (typeSlug) {
    url.searchParams.set('type', typeSlug);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchBusinessInfo(): Promise<BusinessInfo | null> {
  const entries = await fetchEntries<BusinessInfo>('business_info');
  return entries[0]?.body ?? null;
}

export async function fetchFlavors(): Promise<IceCreamFlavor[]> {
  const entries = await fetchEntries<IceCreamFlavor>('ice_cream_flavor');
  return entries.map((e) => e.body).sort((a, b) => a.display_order - b.display_order);
}

export async function fetchServices(): Promise<RentalService[]> {
  const entries = await fetchEntries<RentalService>('rental_service');
  return entries.map((e) => e.body).sort((a, b) => a.display_order - b.display_order);
}

export async function fetchHero(page: string): Promise<PageHero | null> {
  const entries = await fetchEntries<PageHero>('page_hero');
  return entries.find((e) => e.body.page === page)?.body ?? null;
}
