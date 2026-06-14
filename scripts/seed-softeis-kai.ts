import 'dotenv/config';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';
const SEED_EMAIL = process.env['SEED_EMAIL'];
const SEED_PASSWORD = process.env['SEED_PASSWORD'];

if (!SEED_EMAIL || !SEED_PASSWORD) {
  console.error('SEED_EMAIL and SEED_PASSWORD environment variables are required');
  process.exit(1);
}

interface AuthResponse {
  accessToken: string;
}

interface SiteResponse {
  id: string;
  name: string;
}

interface ContentTypeResponse {
  id: string;
  name: string;
  slug: string;
}

interface ContentEntryResponse {
  id: string;
  title: string;
  slug: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${fetchOptions.method ?? 'GET'} ${path} → ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

async function login(): Promise<string> {
  console.log('Authenticating...');
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASSWORD }),
  });
  console.log('Authenticated.');
  return data.accessToken;
}

async function findOrCreateSite(token: string): Promise<string> {
  const sites = await request<SiteResponse[]>('/sites', { token });
  const existing = sites.find((s) => s.name === 'Softeis Kai');
  if (existing) {
    console.log(`Site already exists (id=${existing.id}), skipping creation.`);
    return existing.id;
  }

  console.log('Creating site...');
  const site = await request<SiteResponse>('/sites', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: 'Softeis Kai',
      url: 'https://softeis-kai.de',
      platform: 'custom',
    }),
  });
  console.log(`Site created (id=${site.id}).`);
  return site.id;
}

async function findOrCreateContentType(
  token: string,
  siteId: string,
  name: string,
  slug: string,
  fieldSchema: Record<string, unknown>,
): Promise<string> {
  const existing = await request<ContentTypeResponse[]>(`/sites/${siteId}/content-types`, {
    token,
  });
  const found = existing.find((ct) => ct.slug === slug);
  if (found) {
    console.log(`  Content type "${slug}" already exists (id=${found.id}), skipping.`);
    return found.id;
  }

  const ct = await request<ContentTypeResponse>(`/sites/${siteId}/content-types`, {
    method: 'POST',
    token,
    body: JSON.stringify({ name, slug, fieldSchema }),
  });
  console.log(`  Content type "${slug}" created (id=${ct.id}).`);
  return ct.id;
}

async function createAndPublishEntry(
  token: string,
  siteId: string,
  contentTypeId: string,
  title: string,
  slug: string,
  body: Record<string, unknown>,
): Promise<void> {
  const entry = await request<ContentEntryResponse>(`/sites/${siteId}/entries`, {
    method: 'POST',
    token,
    body: JSON.stringify({
      contentTypeId,
      title,
      slug,
      body,
      status: 'draft',
    }),
  });

  await request(`/sites/${siteId}/entries/${entry.id}/publish`, {
    method: 'POST',
    token,
  });

  console.log(`    Entry "${title}" created and published.`);
}

async function seed(): Promise<void> {
  const token = await login();
  const siteId = await findOrCreateSite(token);

  console.log('\nCreating content types...');

  const businessInfoId = await findOrCreateContentType(
    token,
    siteId,
    'Business Info',
    'business-info',
    {
      company_name: { type: 'string' },
      owner: { type: 'string' },
      street: { type: 'string' },
      city: { type: 'string' },
      zip: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string' },
      founding_year: { type: 'number' },
      tagline: { type: 'string' },
      description: { type: 'string' },
    },
  );

  const iceCreamFlavorId = await findOrCreateContentType(
    token,
    siteId,
    'Ice Cream Flavor',
    'ice-cream-flavor',
    {
      name: { type: 'string' },
      name_de: { type: 'string' },
      base: { type: 'string' },
      secondary: { type: 'string', optional: true },
      display_order: { type: 'number' },
    },
  );

  const rentalServiceId = await findOrCreateContentType(
    token,
    siteId,
    'Rental Service',
    'rental-service',
    {
      name: { type: 'string' },
      description: { type: 'string' },
      ideal_for: { type: 'string' },
      includes_staff: { type: 'boolean' },
      display_order: { type: 'number' },
    },
  );

  const pageHeroId = await findOrCreateContentType(token, siteId, 'Page Hero', 'page-hero', {
    page: { type: 'string' },
    headline: { type: 'string' },
    subheadline: { type: 'string' },
  });

  console.log('\nSeeding entries...');

  console.log('  Business info:');
  await createAndPublishEntry(
    token,
    siteId,
    businessInfoId,
    'Eisspezialitäten Kai Fischer',
    'business-info',
    {
      company_name: 'Eisspezialitäten Kai Fischer',
      owner: 'Kai Fischer',
      street: 'Hauptstraße 25',
      city: 'Hainichen',
      zip: '04567',
      phone: '0173 – 566 72 72',
      email: 'luftballonmann@web.de',
      founding_year: 1999,
      tagline: 'Ihr mobiler Softeis Dealer',
      description:
        'Seit 25 Jahren produzieren wir feinstes Softeis aus regionalen Zutaten im Leipziger Land. 16 Sorten feinsten Softeis – für jeden Geschmack etwas dabei.',
    },
  );

  console.log('  Ice cream flavors:');

  const flavors: Array<{
    title: string;
    slug: string;
    name: string;
    name_de: string;
    base: string;
    secondary: string;
    display_order: number;
  }> = [
    {
      title: 'Vanille',
      slug: 'vanille',
      name: 'Vanilla',
      name_de: 'Vanille',
      base: 'vanilla',
      secondary: '',
      display_order: 1,
    },
    {
      title: 'Vanille-Schokolade',
      slug: 'vanille-schokolade',
      name: 'Vanilla-Chocolate',
      name_de: 'Vanille-Schokolade',
      base: 'vanilla',
      secondary: 'chocolate',
      display_order: 2,
    },
    {
      title: 'Banane-Schokolade',
      slug: 'banane-schokolade',
      name: 'Banana-Chocolate',
      name_de: 'Banane-Schokolade',
      base: 'chocolate',
      secondary: 'banana',
      display_order: 3,
    },
    {
      title: 'Eierlikör-Schokolade',
      slug: 'eierlikor-schokolade',
      name: 'Eggnog-Chocolate',
      name_de: 'Eierlikör-Schokolade',
      base: 'chocolate',
      secondary: 'eggnog',
      display_order: 4,
    },
    {
      title: 'Haselnuss-Nougat-Vanille',
      slug: 'haselnuss-nougat-vanille',
      name: 'Hazelnut-Nougat-Vanilla',
      name_de: 'Haselnuss-Nougat-Vanille',
      base: 'vanilla',
      secondary: 'hazelnut-nougat',
      display_order: 5,
    },
    {
      title: 'Kokos-Weiße Schokolade',
      slug: 'kokos-weisse-schokolade',
      name: 'Coconut-White Chocolate',
      name_de: 'Kokos-Weiße Schokolade',
      base: 'white-chocolate',
      secondary: 'coconut',
      display_order: 6,
    },
    {
      title: 'Erdbeere-Vanille',
      slug: 'erdbeere-vanille',
      name: 'Strawberry-Vanilla',
      name_de: 'Erdbeere-Vanille',
      base: 'vanilla',
      secondary: 'strawberry',
      display_order: 7,
    },
    {
      title: 'Blaubeere-Vanille',
      slug: 'blaubeere-vanille',
      name: 'Blueberry-Vanilla',
      name_de: 'Blaubeere-Vanille',
      base: 'vanilla',
      secondary: 'blueberry',
      display_order: 8,
    },
    {
      title: 'Mango-Vanille',
      slug: 'mango-vanille',
      name: 'Mango-Vanilla',
      name_de: 'Mango-Vanille',
      base: 'vanilla',
      secondary: 'mango',
      display_order: 9,
    },
    {
      title: 'Aprikose-Vanille',
      slug: 'aprikose-vanille',
      name: 'Apricot-Vanilla',
      name_de: 'Aprikose-Vanille',
      base: 'vanilla',
      secondary: 'apricot',
      display_order: 10,
    },
    {
      title: 'Apfel-Vanille',
      slug: 'apfel-vanille',
      name: 'Apple-Vanilla',
      name_de: 'Apfel-Vanille',
      base: 'vanilla',
      secondary: 'apple',
      display_order: 11,
    },
    {
      title: 'Kirsche-Banane',
      slug: 'kirsche-banane',
      name: 'Cherry-Banana',
      name_de: 'Kirsche-Banane',
      base: 'banana',
      secondary: 'cherry',
      display_order: 12,
    },
    {
      title: 'Joghurt-Johannisbeere',
      slug: 'joghurt-johannisbeere',
      name: 'Yogurt-Blackcurrant',
      name_de: 'Joghurt-Johannisbeere',
      base: 'yogurt',
      secondary: 'blackcurrant',
      display_order: 13,
    },
    {
      title: 'Holunderblüte-Joghurt',
      slug: 'holunderbluete-joghurt',
      name: 'Elderflower-Yogurt',
      name_de: 'Holunderblüte-Joghurt',
      base: 'yogurt',
      secondary: 'elderflower',
      display_order: 14,
    },
    {
      title: 'Kirsche-Joghurt',
      slug: 'kirsche-joghurt',
      name: 'Cherry-Yogurt',
      name_de: 'Kirsche-Joghurt',
      base: 'yogurt',
      secondary: 'cherry',
      display_order: 15,
    },
    {
      title: 'Joghurt-Buttermilch-Sanddorn',
      slug: 'joghurt-buttermilch-sanddorn',
      name: 'Yogurt-Buttermilk-Sea Buckthorn',
      name_de: 'Joghurt-Buttermilch-Sanddorn',
      base: 'yogurt',
      secondary: 'sea-buckthorn',
      display_order: 16,
    },
  ];

  for (const flavor of flavors) {
    await createAndPublishEntry(token, siteId, iceCreamFlavorId, flavor.title, flavor.slug, {
      name: flavor.name,
      name_de: flavor.name_de,
      base: flavor.base,
      secondary: flavor.secondary,
      display_order: flavor.display_order,
    });
  }

  console.log('  Rental services:');

  const rentalServices: Array<{
    title: string;
    slug: string;
    name: string;
    description: string;
    ideal_for: string;
    includes_staff: boolean;
    display_order: number;
  }> = [
    {
      title: 'Eiswagen mieten',
      slug: 'eiswagen',
      name: 'Eiswagen mieten',
      description:
        'Charmante Eiswagen für Ihre Veranstaltung – mit oder ohne Personal. Ideal als Attraktion bei Firmenevents, Hochzeiten und Feiern.',
      ideal_for: 'Firmenevent, Hochzeit, Stadtfest, Familienfeier',
      includes_staff: true,
      display_order: 1,
    },
    {
      title: 'Kühl-/Gefrieranhänger mieten',
      slug: 'kuehl-gefrierhaenger',
      name: 'Kühl-/Gefrieranhänger mieten',
      description: 'Professionelle Kühl- und Gefrieranhänger für Ihre Veranstaltung.',
      ideal_for: 'Großveranstaltungen, Catering',
      includes_staff: false,
      display_order: 2,
    },
    {
      title: 'Eistütentheke mieten',
      slug: 'eistutentheke',
      name: 'Eistütentheke mieten',
      description: 'Kompakte Eistütentheken für den flexiblen Einsatz.',
      ideal_for: 'Kleinevent, Schule, Kindergarten',
      includes_staff: false,
      display_order: 3,
    },
    {
      title: 'Zuckerwattemaschine mieten',
      slug: 'zuckerwattemaschine',
      name: 'Zuckerwattemaschine mieten',
      description: 'Zuckerwattemaschinen für unvergessliche Momente bei Ihrer Veranstaltung.',
      ideal_for: 'Kinderfest, Markt, Stadtfest',
      includes_staff: false,
      display_order: 4,
    },
  ];

  for (const service of rentalServices) {
    await createAndPublishEntry(token, siteId, rentalServiceId, service.title, service.slug, {
      name: service.name,
      description: service.description,
      ideal_for: service.ideal_for,
      includes_staff: service.includes_staff,
      display_order: service.display_order,
    });
  }

  console.log('  Page heroes:');

  const pageHeroes: Array<{
    title: string;
    slug: string;
    page: string;
    headline: string;
    subheadline: string;
  }> = [
    {
      title: 'Hero: Startseite',
      slug: 'hero-startseite',
      page: 'home',
      headline: 'Feinstes Softeis seit 25 Jahren',
      subheadline: '16 Sorten – hergestellt aus regionalen Zutaten im Leipziger Land',
    },
    {
      title: 'Hero: Sortiment',
      slug: 'hero-sortiment',
      page: 'sortiment',
      headline: 'Unser Sortiment',
      subheadline: '16 Sorten feinsten Softeis in traumhaften Kombinationen',
    },
    {
      title: 'Hero: Service',
      slug: 'hero-service',
      page: 'service',
      headline: 'Unser Service',
      subheadline: 'Eiswagen, Anhänger, Theken und Zuckerwatte für Ihre Veranstaltung',
    },
    {
      title: 'Hero: Kontakt',
      slug: 'hero-kontakt',
      page: 'kontakt',
      headline: 'Kontakt',
      subheadline: 'Sprechen Sie uns an – wir freuen uns auf Ihre Anfrage',
    },
  ];

  for (const hero of pageHeroes) {
    await createAndPublishEntry(token, siteId, pageHeroId, hero.title, hero.slug, {
      page: hero.page,
      headline: hero.headline,
      subheadline: hero.subheadline,
    });
  }

  console.log('\nSeed complete.');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
