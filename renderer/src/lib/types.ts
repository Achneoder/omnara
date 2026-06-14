export interface ContentType {
  id: string;
  name: string;
  slug: string;
}

export interface Entry<T = Record<string, unknown>> {
  id: string;
  title: string;
  slug: string;
  body: T | null;
  contentType: ContentType;
  publishedAt: string;
}

export interface BusinessInfoBody {
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

export interface IceCreamFlavorBody {
  name: string;
  name_de: string;
  base: 'vanilla' | 'chocolate' | 'yogurt' | 'banana' | 'white-chocolate';
  secondary: string;
  display_order: number;
}

export interface RentalServiceBody {
  name: string;
  description: string;
  ideal_for: string;
  includes_staff: boolean;
  display_order: number;
}

export interface PageHeroBody {
  page: 'home' | 'sortiment' | 'service' | 'kontakt';
  headline: string;
  subheadline: string;
}

export type BusinessInfoEntry = Entry<BusinessInfoBody>;
export type IceCreamFlavorEntry = Entry<IceCreamFlavorBody>;
export type RentalServiceEntry = Entry<RentalServiceBody>;
export type PageHeroEntry = Entry<PageHeroBody>;
