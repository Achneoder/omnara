# omnara — Business Capabilities

This document describes what omnara is built to do and the current implementation state of each capability area. It is the authoritative reference for understanding the system's business scope.

---

## What omnara Does

omnara is a headless CMS where AI agents are the primary operators. Instead of a human navigating a UI to write and publish content, an AI agent talks directly to the MCP Server using natural language and structured tool calls. Humans interact with a separate dashboard to review output, approve changes, and manage configuration that should not be delegated to an AI.

---

## Capability Areas

### 1. Content Management (via MCP)

AI agents create, update, organize, and publish content through MCP Tools exposed by the server. The agent reads site schema and content type definitions from MCP Resources, then issues tool calls to manage content.

**Scope:**

- Create, read, update, and delete content entries
- List and filter content by site, type, status, and date range
- Publish or unpublish content (draft → review → live → archived workflow)
- Attach and detach media references to content entries
- Manage content types with flexible JSON field schemas

**Status:** ✅ **Implemented.** 19 MCP tools, 4 resources, and 3 prompts are registered and functional.

**Details:**

| Capability               | Implementation                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Create content entry     | `create_content_entry` tool — site_id, content_type_id, title, slug, optional body/status/author_session_id |
| List content entries     | `list_content_entries` tool — filterable by content_type_id, status, created_after/before                   |
| Get single entry         | `get_content_entry` tool — by site_id and entry_id                                                          |
| Update entry             | `update_content_entry` tool — partial update, all fields optional                                           |
| Delete entry             | `delete_content_entry` tool — permanent deletion                                                            |
| Publish entry            | `publish_content_entry` tool — sets status=live with publishedAt timestamp                                  |
| Unpublish entry          | `unpublish_content_entry` tool — reverts to draft                                                           |
| Attach media             | `attach_media` tool — URL-based media references with mime type and alt text                                |
| Detach media             | `detach_media` tool — removes media reference from entry                                                    |
| Content type definitions | `omnara://content-types/{siteId}/{slug}` resource — exposes fieldSchema                                     |
| Site schema              | `omnara://sites/schema` resource — full data model for all sites                                            |
| Content workflows        | 3 prompts: `create_blog_post`, `update_product_description`, `review_and_publish`                           |

---

### 2. Multi-Site Support

A single omnara instance manages multiple sites. Each site is isolated: it has its own content, content types, API keys, and theme configuration. Agents scope their operations to a specific site.

**Scope:**

- Register and configure sites (WordPress, Shopify, custom platforms)
- Isolate content, content types, and settings per site
- Per-site API keys for scoped agent access
- Per-site theme and design tokens

**Status:** ✅ **Implemented.** Full site CRUD via REST API and MCP.

**Details:**

| Capability           | Implementation                                                                 |
| -------------------- | ------------------------------------------------------------------------------ |
| Site CRUD            | `GET/POST /sites`, `GET/PATCH/DELETE /sites/:id` — REST API                    |
| Platform types       | `wordpress`, `shopify`, `custom` enum                                          |
| Site settings        | JSONB settings column for per-site configuration                               |
| List sites (MCP)     | `list_sites` tool — returns id, name, url, platform, settings                  |
| Site-scoped content  | All content types, entries, and API keys are scoped to a site via foreign keys |
| Dashboard management | Sites page with create/edit/delete, site-specific sidebar navigation           |

---

### 3. Human Review and Oversight (Dashboard)

The dashboard is the human control surface. It does not replace the AI — it lets operators stay informed and intervene when needed.

**Scope:**

- Review queue: content created by AI with status `review`, awaiting approval
- Activity feed: paginated audit trail of agent actions (what was created, updated, published, and by which session)
- Approve (publish) or reject (archive) AI-created content before it goes live
- Content browser: list, filter, edit, and delete entries across all statuses
- Manage API keys, site configuration, and content types
- Theme management: design tokens, components, import/export

**Status:** ✅ **Implemented.** Full dashboard with 10+ routes covering all management functions.

**Details:**

| Page             | Route                                     | Features                                                        |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Login            | `/login`                                  | Email/password authentication with JWT + refresh token rotation |
| Sites            | `/sites`                                  | List (card grid), create, delete, platform selector             |
| Content          | `/sites/[siteId]/content`                 | Table with status filter, inline edit modal, delete             |
| Review queue     | `/sites/[siteId]/review`                  | Approve → publish, Reject → archive cards                       |
| API keys         | `/sites/[siteId]/api-keys`                | Generate (with copy-once reveal), list, revoke                  |
| Settings         | `/sites/[siteId]/settings`                | Edit site name/URL/platform, manage content types               |
| Theme overview   | `/sites/[siteId]/theme`                   | Name, version, token/component counts, import, delete           |
| Design tokens    | `/sites/[siteId]/theme/tokens`            | Inline key-value editor with color swatches                     |
| Components       | `/sites/[siteId]/theme/components`        | List with category badges, edit/delete                          |
| Component editor | `/sites/[siteId]/theme/components/[slug]` | Template + CSS + props schema with live preview                 |
| Activity feed    | `/activity`                               | Paginated, filterable by site/action/date range                 |

**Reusable UI components:** Button (4 variants, loading state), Badge (6 variants), Modal, EmptyState, ErrorAlert, FormField, LoadingSpinner, Sidebar, SiteSidebar, ComponentPreview, ImportThemeModal.

---

### 4. Site Serving (Server-Side Rendering)

The NestJS server renders published content as complete HTML pages, making managed sites browsable directly from the server without any external frontend. Pages include full theme integration and are served unauthenticated.

**Scope:**

- Server-side rendered HTML pages for every managed site
- Full theme integration: design tokens, raw CSS, and component-scoped styles injected into every page
- Component template rendering using `{{placeholder}}` syntax with HTML escaping
- Semantic field fallback when no theme component is assigned to a content type
- Multi-site support: each site served under its own route prefix

**Status:** ✅ **Implemented.** Four public routes serving complete HTML documents.

**Details:**

| Route                                        | Purpose                                                              |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `GET /s/:siteId`                             | Site home page — lists all content types with published entry counts |
| `GET /s/:siteId/content-types`               | Content type listing with entry counts                               |
| `GET /s/:siteId/:contentTypeSlug`            | Published entries for a content type, ordered by publish date        |
| `GET /s/:siteId/:contentTypeSlug/:entrySlug` | Single entry rendered with component template or semantic fields     |

**Rendering pipeline:**

1. Validate site existence and fetch theme (tokens, raw CSS, components)
2. Query published content entries filtered by content type and status
3. If a theme component is assigned to the content type: substitute `{{placeholder}}` tokens with escaped body values via props schema
4. If no component is assigned: render fields semantically (richtext, URLs, text, arrays, nested objects)
5. Assemble a complete HTML5 document with theme CSS custom properties, raw CSS, and component-scoped styles

**Security:**

- All user-content values are HTML-escaped before injection (XSS prevention)
- Theme CSS is sanitized by the existing `ThemesService.sanitizeRawCss()` pipeline
- No authentication required — built for end-user traffic

---

### 5. MCP Client (Headless Content Consumer)

The MCP Client is a Svelte 5 frontend that consumes published content from the public API. It demonstrates how any frontend can render omnara-managed content using theme-driven templates.

**Scope:**

- Browse published (live) content entries
- View individual entries with semantic field rendering
- Theme-driven component rendering using HTML templates with `{{placeholder}}` syntax
- Runtime theme injection: CSS custom properties, component-scoped styles, ETag-based caching

**Status:** ✅ **Implemented.** Three routes rendering published content with full theme integration.

**Details:**

| Page         | Route           | Features                                                                         |
| ------------ | --------------- | -------------------------------------------------------------------------------- |
| Home         | `/`             | Landing page with browse link                                                    |
| Content list | `/pages`        | Card grid of live entries with content type badges and publish dates             |
| Entry detail | `/pages/[slug]` | Field-based rendering (richtext, URLs, headings) or component template rendering |

**Theme integration:**

- Loads theme tokens, raw CSS, and component styles from the public API
- Injects CSS custom properties and scoped component styles into the DOM
- Polls for theme updates every 30 seconds with ETag conditional requests
- Template engine maps `{{placeholder}}` syntax to content body fields via props schema, with HTML escaping

---

### 6. MCP Protocol Layer

The MCP Server exposes a standards-compliant MCP endpoint that any MCP-compatible agent — including Claude.ai Pro, Max, and Teams — can connect to directly.

**Status:** ✅ **Implemented.** Full MCP capabilities with SSE transport.

| Layer                                           | Status                    |
| ----------------------------------------------- | ------------------------- |
| SSE transport (`GET /mcp/sse`)                  | ✅ Working                |
| Message handler (`POST /mcp/messages`)          | ✅ Working                |
| Session tracking (in-memory, query-param-based) | ✅ Working                |
| API key authentication on MCP endpoints         | ✅ Working                |
| MCP Tools (19)                                  | ✅ Implemented and tested |
| MCP Resources (4)                               | ✅ Implemented and tested |
| MCP Prompts (3)                                 | ✅ Implemented and tested |

**Tools registered:**

| Tool                               | Category         |
| ---------------------------------- | ---------------- |
| `list_sites`                       | Site management  |
| `list_content_types`               | Content modeling |
| `list_content_entries`             | Content CRUD     |
| `get_content_entry`                | Content CRUD     |
| `create_content_entry`             | Content CRUD     |
| `update_content_entry`             | Content CRUD     |
| `delete_content_entry`             | Content CRUD     |
| `publish_content_entry`            | Content workflow |
| `unpublish_content_entry`          | Content workflow |
| `attach_media`                     | Media            |
| `detach_media`                     | Media            |
| `get_site_theme`                   | Theme            |
| `import_theme`                     | Theme            |
| `list_theme_components`            | Theme            |
| `get_theme_component`              | Theme            |
| `upsert_theme_component`           | Theme            |
| `delete_theme_component`           | Theme            |
| `assign_component_to_content_type` | Theme            |

**Resources registered:**

| Resource URI                             | Description                                                     |
| ---------------------------------------- | --------------------------------------------------------------- |
| `omnara://sites/schema`                  | Full data model: all sites with content types and field schemas |
| `omnara://content-types/{siteId}/{slug}` | Single content type definition with fieldSchema                 |
| `theme://{siteId}`                       | Full theme document (tokens, rawCss, components)                |
| `theme://{siteId}/component/{slug}`      | Single theme component details                                  |

**Prompts registered:**

| Prompt                       | Description                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `create_blog_post`           | Step-by-step guidance for composing and publishing a blog post                 |
| `update_product_description` | Guidance for improving an existing product entry's description                 |
| `review_and_publish`         | Guidance for reviewing entries in `review` status and publishing approved ones |

---

### 7. REST API (Dashboard + External Consumers)

The same NestJS server exposes a REST API used by the dashboard and available to any external frontend or integration.

**Status:** ✅ **Implemented.** 30+ endpoints across 8 controllers.

| Controller       | Auth  | Endpoints                                                                     |
| ---------------- | ----- | ----------------------------------------------------------------------------- |
| Auth             | Mixed | `POST /auth/login`, `/logout`, `/refresh`, `GET /me`, `POST /change-password` |
| Sites            | JWT   | Full CRUD (5 endpoints)                                                       |
| API Keys         | JWT   | List, create, revoke (3 endpoints)                                            |
| Content Types    | JWT   | Full CRUD (5 endpoints)                                                       |
| Content Entries  | JWT   | CRUD + publish/unpublish (7 endpoints)                                        |
| Media References | JWT   | List, attach, detach (3 endpoints)                                            |
| Activity Log     | JWT   | List with filters (1 endpoint)                                                |
| Themes           | JWT   | Get, update, delete, import, components CRUD, assign (9 endpoints)            |
| Public           | None  | Published entries, content types, theme (3 endpoints)                         |

---

### 8. Authentication and Access Control

**Status:** ✅ **Implemented.** Dual auth system with security hardening.

| Capability             | Implementation                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| JWT access tokens      | HS256, configurable expiry (default 15m), issued at login and refresh                             |
| Refresh token rotation | Family-based with theft detection — reusing a revoked token revokes the entire family             |
| Password hashing       | Argon2id with timing-safe dummy hash for non-existent users (prevents enumeration)                |
| Account lockout        | 5 failed attempts → 15-minute lockout, cleared on successful login                                |
| API key auth           | Per-site keys with `omk_` prefix, stored as Argon2 hashes, dev fallback via `MCP_API_KEY` env var |
| Rate limiting          | Global: 100 req/60s; Login: 10 req/60s; MCP SSE: exempt                                           |
| Security headers       | Helmet, CORS restricted to configured origins, 100kb body limit                                   |
| User roles             | `admin` and `editor` roles stored in JWT payload (enforcement not yet wired to endpoint guards)   |

---

### 9. Theme and Design System

**Status:** ✅ **Implemented.** Full theme management with component-based rendering.

| Capability                | Implementation                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Design tokens             | JSONB-stored CSS custom properties (colors, typography, spacing, radii, shadows, motion)       |
| Raw CSS                   | Per-theme global CSS with sanitization (blocks `</style>`, `expression()`, `javascript:` URLs) |
| Theme components          | HTML templates with `{{placeholder}}` syntax, scoped CSS, 10 categories                        |
| Props schema              | JSONB mapping placeholder names to content entry body field keys                               |
| Component-to-content-type | Assign a theme component to a content type for automated rendering                             |
| Atomic import             | Single JSON payload upserts theme metadata + all components                                    |
| ETag caching              | Public theme endpoint supports conditional GET with 304 Not Modified                           |
| Light/dark mode           | CSS custom property variants under `[data-theme="dark"]` selector                              |
| Dashboard editor          | Inline token editing with color swatches, component editor with live preview                   |
| Storybook                 | UI component library with design system primitives                                             |

**Component categories:** layout, hero, card, article, product, media, cta, nav, footer, misc.

---

### 10. Content Modeling

**Status:** ✅ **Implemented.** Flexible content types with JSON field schemas.

| Capability      | Implementation                                                                         |
| --------------- | -------------------------------------------------------------------------------------- |
| Content types   | Per-site types with unique (site, slug) constraint                                     |
| Field schemas   | JSONB column for arbitrary field definitions                                           |
| Content entries | JSONB body column — structure defined by the content type's field schema               |
| Status workflow | 4-stage: draft → review → live → archived                                              |
| Author tracking | Optional `authorSessionId` on entries for auditing which agent session created content |

---

### 11. Activity Logging

**Status:** ✅ **Implemented.** Fire-and-forget audit trail for all content operations.

| Capability       | Implementation                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Action recording | Every write operation logs: site, session ID, action verb, entity type/ID, metadata JSON |
| Query API        | `GET /activity` with filters: siteId, action, date range, pagination (limit/offset)      |
| Dashboard view   | Paginated table with site/action/date filters and debounced search                       |
| Retention        | All logs stored indefinitely in `activity_logs` table                                    |

---

### 12. Database Layer

**Status:** ✅ **Implemented.** PostgreSQL via MikroORM with auto-migration on startup.

| Entity         | Table              | Key Relations                                          |
| -------------- | ------------------ | ------------------------------------------------------ |
| User           | `users`            | —                                                      |
| RefreshToken   | `refresh_tokens`   | FK → users (CASCADE)                                   |
| Site           | `sites`            | —                                                      |
| ApiKey         | `api_keys`         | FK → sites (CASCADE)                                   |
| ContentType    | `content_types`    | FK → sites (CASCADE), FK → theme_components (SET NULL) |
| ContentEntry   | `content_entries`  | FK → sites (CASCADE), FK → content_types (RESTRICT)    |
| MediaReference | `media_references` | FK → content_entries (CASCADE)                         |
| ActivityLog    | `activity_logs`    | FK → sites (SET NULL)                                  |
| SiteTheme      | `site_themes`      | 1:1 → sites (CASCADE)                                  |
| ThemeComponent | `theme_components` | FK → site_themes (CASCADE)                             |

**Migrations:** 4 migrations covering initial schema, phase 1 entities, composite indexes, and theme tables. Migrations run automatically on server startup (`migrationsRun: true`).

---

## Implementation Summary

| Capability                                    | Status      |
| --------------------------------------------- | ----------- |
| Server bootstrap and health checks            | ✅ Complete |
| MCP SSE/HTTP transport                        | ✅ Complete |
| MCP Tools (40 tools)                          | ✅ Complete |
| MCP Resources (4 resources)                   | ✅ Complete |
| MCP Prompts (3 prompts)                       | ✅ Complete |
| Content REST API                              | ✅ Complete |
| Multi-site support                            | ✅ Complete |
| JWT authentication + refresh tokens           | ✅ Complete |
| API key authentication                        | ✅ Complete |
| Account lockout                               | ✅ Complete |
| Rate limiting                                 | ✅ Complete |
| Database entities and migrations              | ✅ Complete |
| Human review queue (Dashboard)                | ✅ Complete |
| Activity feed (Dashboard)                     | ✅ Complete |
| Content browser (Dashboard)                   | ✅ Complete |
| Assets media browser (Dashboard)              | ✅ Complete |
| API key management (Dashboard)                | ✅ Complete |
| Theme management (Dashboard)                  | ✅ Complete |
| Design token editor (Dashboard)               | ✅ Complete |
| Theme component editor (Dashboard)            | ✅ Complete |
| Headless content consumer (Client)            | ✅ Complete |
| Theme-driven template rendering               | ✅ Complete |
| Design system (tokens, components, Storybook) | ✅ Complete |
| Public API (unauthenticated content delivery) | ✅ Complete |
| Site Serving (server-side rendered pages)     | ✅ Complete |
| Pages with multi-section composition          | ✅ Complete |
| Navigation / menus (header, footer)           | ✅ Complete |
| File upload + static asset serving            | ✅ Complete |
| Image optimization (WebP variants via sharp)  | ✅ Complete |
| Font auto-download + GDPR-safe local serving  | ✅ Complete |
| Favicon support                               | ✅ Complete |
| Docker Compose + setup script                 | ✅ Complete |

---

## What's Not Yet Implemented

| Capability                            | Notes                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| Webhook system                        | No outbound webhooks for content events                                       |
| Content versioning / rollback         | No revision history                                                           |
| Role-based access control enforcement | Roles exist in JWT but are not checked by endpoint guards                     |
| User registration endpoint            | RegisterDto exists but no controller route                                    |
| User management CRUD                  | No list/update/delete user endpoints                                          |
| Full-text search                      | No search indexing on content                                                 |
| API versioning                        | No versioning strategy in place                                               |
| WordPress migration tool              | Platform type exists but no import tooling                                    |
| Shopify integration                   | Platform type exists but no sync layer                                        |
| Agent chat interface (MCP Client)     | Client currently renders published content, does not host agent conversations |
