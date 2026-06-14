import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth.svelte';
import type {
  Site,
  ApiKey,
  ApiKeyCreated,
  ContentType,
  ContentEntry,
  ContentStatus,
  ActivityLog,
} from '$lib/types';

function getBaseUrl(): string {
  if (!browser) return '';
  return (import.meta.env.PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3000';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (res.status === 401) {
    const refreshed = await auth.refreshToken();
    if (!refreshed) {
      throw new ApiError(401, 'Unauthorized');
    }
    const retryHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${auth.accessToken}`,
    };
    const retryRes = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      credentials: 'include',
      headers: retryHeaders,
    });
    if (!retryRes.ok) {
      await throwApiError(retryRes);
    }
    if (retryRes.status === 204) return undefined as T;
    return retryRes.json();
  }

  if (!res.ok) {
    await throwApiError(res);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function throwApiError(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new ApiError(res.status, body.message ?? `HTTP ${res.status}`);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface CreateSiteDto {
  name: string;
  url: string;
  platform: 'wordpress' | 'shopify' | 'custom';
  settings?: Record<string, unknown>;
}

export interface UpdateSiteDto {
  name?: string;
  url?: string;
  platform?: 'wordpress' | 'shopify' | 'custom';
  settings?: Record<string, unknown>;
}

export interface CreateApiKeyDto {
  label: string;
}

export interface CreateContentTypeDto {
  name: string;
  slug: string;
  fieldSchema?: Record<string, unknown>;
}

export interface UpdateContentTypeDto {
  name?: string;
  slug?: string;
  fieldSchema?: Record<string, unknown>;
}

export interface CreateEntryDto {
  title: string;
  slug: string;
  body?: Record<string, unknown>;
  status?: ContentStatus;
  contentTypeId?: string;
}

export interface UpdateEntryDto {
  title?: string;
  slug?: string;
  body?: Record<string, unknown>;
  status?: ContentStatus;
}

export interface ActivityQueryParams {
  siteId?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const api = {
  sites: {
    list: () => request<Site[]>('/sites'),
    get: (id: string) => request<Site>(`/sites/${id}`),
    create: (dto: CreateSiteDto) =>
      request<Site>('/sites', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateSiteDto) =>
      request<Site>(`/sites/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    delete: (id: string) => request<void>(`/sites/${id}`, { method: 'DELETE' }),
  },

  apiKeys: {
    list: (siteId: string) => request<ApiKey[]>(`/sites/${siteId}/api-keys`),
    create: (siteId: string, dto: CreateApiKeyDto) =>
      request<ApiKeyCreated>(`/sites/${siteId}/api-keys`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    revoke: (siteId: string, keyId: string) =>
      request<void>(`/sites/${siteId}/api-keys/${keyId}`, { method: 'DELETE' }),
  },

  contentTypes: {
    list: (siteId: string) => request<ContentType[]>(`/sites/${siteId}/content-types`),
    get: (siteId: string, id: string) =>
      request<ContentType>(`/sites/${siteId}/content-types/${id}`),
    create: (siteId: string, dto: CreateContentTypeDto) =>
      request<ContentType>(`/sites/${siteId}/content-types`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    update: (siteId: string, id: string, dto: UpdateContentTypeDto) =>
      request<ContentType>(`/sites/${siteId}/content-types/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    delete: (siteId: string, id: string) =>
      request<void>(`/sites/${siteId}/content-types/${id}`, { method: 'DELETE' }),
  },

  entries: {
    list: (siteId: string, status?: ContentStatus) =>
      request<ContentEntry[]>(`/sites/${siteId}/entries${buildQuery({ status })}`),
    get: (siteId: string, id: string) => request<ContentEntry>(`/sites/${siteId}/entries/${id}`),
    create: (siteId: string, dto: CreateEntryDto) =>
      request<ContentEntry>(`/sites/${siteId}/entries`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    update: (siteId: string, id: string, dto: UpdateEntryDto) =>
      request<ContentEntry>(`/sites/${siteId}/entries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    delete: (siteId: string, id: string) =>
      request<void>(`/sites/${siteId}/entries/${id}`, { method: 'DELETE' }),
    publish: (siteId: string, id: string) =>
      request<ContentEntry>(`/sites/${siteId}/entries/${id}/publish`, { method: 'POST' }),
    unpublish: (siteId: string, id: string) =>
      request<ContentEntry>(`/sites/${siteId}/entries/${id}/unpublish`, { method: 'POST' }),
  },

  activity: {
    list: (params: ActivityQueryParams = {}) =>
      request<ActivityLog[]>(
        `/activity${buildQuery(params as Record<string, string | number | undefined>)}`,
      ),
  },
};
