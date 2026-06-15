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
  body: Record<string, unknown> | null;
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

export interface ThemeComponent {
  id: string;
  slug: string;
  name: string;
  category: string;
  template: string;
  css: string | null;
  propsSchema: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SiteTheme {
  id: string;
  name: string;
  version: string;
  tokens: Record<string, string>;
  rawCss: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  url: string;
  variants: Record<string, string>;
}

export interface Webhook {
  id: string;
  url: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookCreated extends Webhook {
  plaintextSecret: string;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  attempts: number;
  success: boolean;
  deliveredAt: string | null;
  createdAt: string;
}
