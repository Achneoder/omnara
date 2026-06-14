export interface ContentTypeField {
  name: string;
  type: string;
  required: boolean;
}

export interface ThemeComponentRef {
  slug: string;
  template: string;
  css: string | null;
  propsSchema: Record<string, string>;
}

export interface ContentType {
  name: string;
  slug: string;
  fieldSchema: {
    fields: ContentTypeField[];
  };
  component: ThemeComponentRef | null;
}

export interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'review' | 'live' | 'archived';
  publishedAt: string | null;
  body: Record<string, unknown> | null;
  contentType: ContentType;
  createdAt: string;
  updatedAt: string;
}

const apiUrl = import.meta.env.VITE_API_URL as string;
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD as string;

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { accessToken: string };
  cachedToken = data.accessToken;
  return cachedToken;
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchEntries(siteId: string): Promise<ContentEntry[]> {
  return apiFetch<ContentEntry[]>(`/sites/${siteId}/entries?status=live`);
}

export async function fetchEntry(siteId: string, slug: string): Promise<ContentEntry> {
  const entries = await fetchEntries(siteId);
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`Entry not found: ${slug}`);
  }
  return entry;
}

export interface SiteThemeData {
  id: string;
  name: string;
  version: string;
  tokens: Record<string, string>;
  rawCss: string | null;
  components: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    template: string;
    css: string | null;
    propsSchema: Record<string, string>;
  }>;
  updatedAt: string;
}

export async function fetchTheme(
  siteId: string,
  prevEtag?: string,
): Promise<{ data: SiteThemeData | null; etag: string | null }> {
  const headers: Record<string, string> = {};
  if (prevEtag) headers['If-None-Match'] = prevEtag;

  const res = await fetch(`${apiUrl}/public/sites/${siteId}/theme`, { headers });

  if (res.status === 304) return { data: null, etag: prevEtag ?? null };
  if (res.status === 404) return { data: null, etag: null };
  if (!res.ok) throw new Error(`Theme fetch failed: ${res.status}`);

  const data = (await res.json()) as SiteThemeData;
  const etag = res.headers.get('etag');
  return { data, etag };
}
