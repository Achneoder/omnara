# omnara — Implementation Roadmap

Generated: 2026-06-14. Source of truth: [`docs/capabilities.md`](./capabilities.md).

---

## Completed Phases

### ✅ Phase 1 — Database Foundation

All core entities and relations exist in the database.

| Task                                                                                                                                | Status   |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Site` entity — id, name, url, platform (enum), settings JSONB, timestamps                                                          | Complete |
| `ApiKey` entity — id, keyHash, label, site FK, lastUsedAt, revokedAt, timestamps                                                    | Complete |
| `ContentType` entity — id, site FK, name, slug, fieldSchema JSONB, component FK, timestamps                                         | Complete |
| `ContentEntry` entity — id, site FK, contentType FK, title, slug, body JSONB, status enum, publishedAt, authorSessionId, timestamps | Complete |
| `MediaReference` entity — id, contentEntry FK, url, altText, mimeType, timestamps                                                   | Complete |
| `ActivityLog` entity — id, site FK nullable, sessionId, action, entityType, entityId, metadata JSONB, createdAt                     | Complete |
| `SiteTheme` entity — id, site 1:1 FK, name, version, tokens JSONB, rawCss, timestamps                                               | Complete |
| `ThemeComponent` entity — id, theme FK, name, slug, category enum, template, css, propsSchema JSONB, timestamps                     | Complete |
| All migrations bundled and auto-running on startup                                                                                  | Complete |

---

### ✅ Phase 2 — Site Management REST API

Sites can be created and managed via REST, with per-site API keys for agent access.

| Task                                                         | Status   |
| ------------------------------------------------------------ | -------- |
| `SitesModule` — entity, service, controller, DTOs            | Complete |
| `GET/POST /sites`, `GET/PATCH/DELETE /sites/:id`             | Complete |
| JWT guard applied to all site endpoints                      | Complete |
| `ApiKeysModule` — generate, list, revoke API keys per site   | Complete |
| API keys with `omk_` prefix, Argon2 hashing, one-time reveal | Complete |
| Unit + integration tests for sites and API keys              | Complete |

---

### ✅ Phase 3 — Content REST API

Full CRUD for content types and entries available over REST, including draft → live workflow.

| Task                                                               | Status   |
| ------------------------------------------------------------------ | -------- |
| `ContentTypesModule` — entity, service, controller, DTOs           | Complete |
| Full CRUD for content types (unique slug per site)                 | Complete |
| `ContentEntriesModule` — entity, service, controller, DTOs         | Complete |
| `GET /sites/:siteId/entries` with filters (type, status, date)     | Complete |
| `POST/PATCH/DELETE /sites/:siteId/entries/:id`                     | Complete |
| `POST /sites/:siteId/entries/:id/publish` and `/unpublish`         | Complete |
| `MediaReferencesModule` — attach/detach media to entries           | Complete |
| `ActivityLogModule` — fire-and-forget audit trail, `GET /activity` | Complete |
| Unit + integration tests for all content endpoints                 | Complete |

---

### ✅ Phase 4 — MCP Capabilities

Agents connecting over SSE can perform all content operations through MCP Tools, read site schema via Resources, and use guided Prompts.

| Task                                                          | Status   |
| ------------------------------------------------------------- | -------- |
| API key validation on MCP endpoints                           | Complete |
| MCP Tool: `list_sites`                                        | Complete |
| MCP Tool: `list_content_types` (site-scoped)                  | Complete |
| MCP Tool: `list_content_entries` (filterable)                 | Complete |
| MCP Tool: `get_content_entry`                                 | Complete |
| MCP Tool: `create_content_entry`                              | Complete |
| MCP Tool: `update_content_entry`                              | Complete |
| MCP Tool: `delete_content_entry`                              | Complete |
| MCP Tool: `publish_content_entry` / `unpublish_content_entry` | Complete |
| MCP Tool: `attach_media` / `detach_media`                     | Complete |
| MCP Tool: `get_site_theme`                                    | Complete |
| MCP Tool: `import_theme`                                      | Complete |
| MCP Tool: `list_theme_components`                             | Complete |
| MCP Tool: `get_theme_component`                               | Complete |
| MCP Tool: `upsert_theme_component`                            | Complete |
| MCP Tool: `delete_theme_component`                            | Complete |
| MCP Tool: `assign_component_to_content_type`                  | Complete |
| MCP Resource: `omnara://sites/schema`                         | Complete |
| MCP Resource: `omnara://content-types/{siteId}/{slug}`        | Complete |
| MCP Resource: `theme://{siteId}`                              | Complete |
| MCP Resource: `theme://{siteId}/component/{slug}`             | Complete |
| MCP Prompt: `create_blog_post`                                | Complete |
| MCP Prompt: `update_product_description`                      | Complete |
| MCP Prompt: `review_and_publish`                              | Complete |
| Tool + Resource + Prompt tests (success + error paths)        | Complete |

---

### ✅ Phase 5 — Dashboard UI

Human operators can log in, inspect agent activity, review and approve/reject AI-created content, manage sites, manage API keys, and configure themes.

| Task                                                                          | Status   |
| ----------------------------------------------------------------------------- | -------- |
| SvelteKit routing — all routes and layouts defined                            | Complete |
| Auth flow — login page, Svelte 5 rune-based auth store, protected route guard | Complete |
| Sites list page — card grid, create, edit, delete                             | Complete |
| API keys page — generate (copy-once reveal), list, revoke                     | Complete |
| Review queue — approve → publish, reject → archive                            | Complete |
| Activity feed — paginated, filterable by site/action/date                     | Complete |
| Content browser — table with status filter, inline edit modal, delete         | Complete |
| Site settings — name, URL, platform, content type CRUD                        | Complete |
| Theme overview — name, version, token/component counts, import, delete        | Complete |
| Design tokens editor — inline editing with color swatches, save               | Complete |
| Theme components list — with category badges, edit/delete                     | Complete |
| Component editor — template + CSS + props schema with live preview            | Complete |
| Shared API client module with auto-refresh on 401                             | Complete |
| Reusable UI components — Button, Badge, Modal, EmptyState, ErrorAlert, etc.   | Complete |
| Component tests                                                               | Complete |

---

### ✅ Phase 6 — MCP Client (Headless Content Consumer)

A Svelte 5 frontend that consumes published content via the public API with theme-driven rendering.

| Task                                                                          | Status   |
| ----------------------------------------------------------------------------- | -------- |
| SvelteKit routing — home, content list, entry detail                          | Complete |
| Published content listing — card grid with badges and dates                   | Complete |
| Individual entry view — field-based or component template rendering           | Complete |
| Theme injection — CSS custom properties, component styles, ETag caching       | Complete |
| Template rendering engine — `{{placeholder}}` substitution with HTML escaping | Complete |
| Public API client module                                                      | Complete |
| Component tests                                                               | Complete |

---

## Planned Phases

### 🔜 Phase 7 — Media Management

**Goal:** First-class file upload and image management instead of URL-only references.

| Task                                                                    | Scope        |
| ----------------------------------------------------------------------- | ------------ |
| File upload endpoints (multipart) with size/type validation             | `server`     |
| Image optimization pipeline (resize, format conversion, WebP/AVIF)      | `server`     |
| Media library page in dashboard — browse, search, delete uploaded files | `dashboard`  |
| MCP tool: `upload_media` — agents can upload images directly            | `server/mcp` |
| Storage backends — local disk, S3-compatible object storage             | `server`     |
| Media references linked to uploaded files (not just external URLs)      | `server`     |

---

### 🔜 Phase 8 — Access Control & Multi-User

**Goal:** Role-based access control enforcement and multi-user management.

| Task                                                                   | Scope       |
| ---------------------------------------------------------------------- | ----------- |
| Role guard — enforce `admin` vs `editor` permissions at endpoint level | `server`    |
| User management — list, create, update, delete users (admin only)      | `server`    |
| User registration endpoint with invite flow                            | `server`    |
| Per-site user assignment and permissions                               | `server`    |
| User management page in dashboard                                      | `dashboard` |
| Session management — view and revoke active sessions                   | `dashboard` |

---

### 🔜 Phase 9 — Content Versioning & History

**Goal:** Track content revisions and support rollback.

| Task                                                         | Scope        |
| ------------------------------------------------------------ | ------------ |
| Content version entity — snapshot entry state on each update | `server`     |
| Version history endpoint — list versions for an entry        | `server`     |
| Rollback endpoint — restore entry to a previous version      | `server`     |
| Diff view — compare two versions side by side                | `dashboard`  |
| MCP tool: `list_entry_versions`, `restore_entry_version`     | `server/mcp` |

---

### 🔜 Phase 10 — Webhooks & Integrations

**Goal:** Notify external systems when content changes, enable build triggers and downstream sync.

| Task                                                                         | Scope       |
| ---------------------------------------------------------------------------- | ----------- |
| Webhook configuration per site — URL, secret, event types                    | `server`    |
| Event system — entry.created, entry.updated, entry.published, entry.archived | `server`    |
| Outbound HTTP delivery with retry and delivery log                           | `server`    |
| Webhook management page in dashboard                                         | `dashboard` |
| WordPress migration tool — import posts, pages, media from WordPress export  | `server`    |
| Shopify product sync — read/write product descriptions via Shopify Admin API | `server`    |

---

### 🔜 Phase 11 — Developer Experience

**Goal:** API documentation, SDKs, and improved onboarding.

| Task                                                 | Scope        |
| ---------------------------------------------------- | ------------ |
| OpenAPI/Swagger documentation for REST API           | `server`     |
| TypeScript SDK package for programmatic API access   | root package |
| API versioning strategy (URL-based or header-based)  | `server`     |
| Postman collection or OpenAPI spec for all endpoints | `docs`       |
| Interactive API playground                           | `docs`       |

---

### 🔜 Phase 12 — MCP Client Chat Interface

**Goal:** The MCP Client becomes a full agent chat interface with inline tool-call visibility and in-context controls.

| Task                                                                             | Scope    |
| -------------------------------------------------------------------------------- | -------- |
| Chat session list — create, label, resume sessions                               | `client` |
| Chat view — message input, assistant response rendering                          | `client` |
| MCP over HTTP connection manager                                                 | `client` |
| Tool-call trace component — expandable inline view of tool name, inputs, outputs | `client` |
| Draft preview card — renders content entry fields before publish                 | `client` |
| One-click publish button surfaced in draft preview                               | `client` |
| Session persistence — save and restore chat history                              | `client` |

---

### 🔜 Phase 13 — Search & Discovery

**Goal:** Full-text search across content entries and media.

| Task                                                         | Scope                 |
| ------------------------------------------------------------ | --------------------- |
| PostgreSQL full-text search on content entries (title, body) | `server`              |
| Search endpoint with relevance scoring and highlighting      | `server`              |
| MCP tool: `search_content_entries`                           | `server/mcp`          |
| Search UI in dashboard and client                            | `dashboard`, `client` |

---

## Dependency Graph

```
✅ Phase 1 (DB entities)
    └── ✅ Phase 2 (Sites REST)
            └── ✅ Phase 3 (Content REST + Activity Log)
                    ├── ✅ Phase 4 (MCP Capabilities)
                    └── ✅ Phase 5 (Dashboard UI)
✅ Phase 6 (MCP Client) ──depends on── ✅ Phase 3

🔜 Phase 7 (Media) ──depends on── ✅ Phase 3
🔜 Phase 8 (Access Control) ──depends on── ✅ Phase 1
🔜 Phase 9 (Versioning) ──depends on── ✅ Phase 3
🔜 Phase 10 (Webhooks) ──depends on── ✅ Phase 3
🔜 Phase 11 (DX) ──depends on── ✅ Phase 3
🔜 Phase 12 (Chat Client) ──depends on── ✅ Phase 4
🔜 Phase 13 (Search) ──depends on── ✅ Phase 3
```

Phases 7–13 are independent of each other and can be worked on in any order.

---

## What Each Agent Session Should Know

When working on a phase:

1. Read [`docs/capabilities.md`](./capabilities.md) for business intent and current state.
2. Read `CLAUDE.md` for code standards, git workflow, and test requirements.
3. Read the existing module most relevant to the work (e.g. `server/src/modules/content-entries/` for content patterns).
4. Check open PRs (`gh pr list`) to avoid stepping on in-flight work.
