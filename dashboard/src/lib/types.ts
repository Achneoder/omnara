export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  platform: 'wordpress' | 'shopify' | 'custom';
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  label: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  fieldSchema: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = 'draft' | 'review' | 'live' | 'archived';

export interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: ContentStatus;
  publishedAt: string | null;
  contentTypeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  siteId: string;
  sessionId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
