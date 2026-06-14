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
| `Page` entity — id, site FK, title, slug, isHomepage, meta JSONB, status, sortOrder, timestamps                                     | Complete |
| `PageSection` entity — id, page FK, component FK, sortOrder, props JSONB, timestamps                                                | Complete |
| `MenuItem` entity — id, site FK, label, url, parent FK (self-ref), sortOrder, menuName, timestamps                                  | Complete |
| `Asset` entity — id, site FK, originalName, storagePath, mimeType, size, category, variants JSONB, timestamps                       | Complete |
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

**40 MCP tools registered** — full CRUD across sites, content types, entries, themes, pages, navigation, and assets.

| Category        | Tools                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sites           | `list_sites`, `create_site`, `update_site`, `delete_site`                                                                                                                                          |
| Content Types   | `list_content_types`, `create_content_type`, `update_content_type`, `delete_content_type`                                                                                                          |
| Content Entries | `list_content_entries`, `get_content_entry`, `create_content_entry`, `update_content_entry`, `delete_content_entry`, `publish_content_entry`, `unpublish_content_entry`                            |
| Media           | `attach_media`, `detach_media`                                                                                                                                                                     |
| Theme           | `get_site_theme`, `import_theme`, `list_theme_components`, `get_theme_component`, `upsert_theme_component`, `delete_theme_component`, `assign_component_to_content_type`                           |
| Pages           | `create_page`, `update_page`, `delete_page`, `list_pages`, `get_page`, `add_page_section`, `update_page_section`, `remove_page_section`, `reorder_page_sections`, `publish_page`, `unpublish_page` |
| Navigation      | `create_menu_item`, `list_menu_items`, `update_menu_item`, `delete_menu_item`, `reorder_menu_items`                                                                                                |
| Assets          | `upload_asset`, `list_assets`, `delete_asset`                                                                                                                                                      |

**4 MCP Resources** — `omnara://sites/schema`, `omnara://content-types/{siteId}/{slug}`, `theme://{siteId}`, `theme://{siteId}/component/{slug}`

**3 MCP Prompts** — `create_blog_post`, `update_product_description`, `review_and_publish`

---

### ✅ Phase 5 — Dashboard UI

Human operators can log in, inspect agent activity, review and approve/reject AI-created content, manage sites, manage API keys, configure themes, browse assets, and manage pages.

| Task                                                                          | Status   |
| ----------------------------------------------------------------------------- | -------- |
| SvelteKit routing — all routes and layouts defined                            | Complete |
| Auth flow — login page, Svelte 5 rune-based auth store, protected route guard | Complete |
| Sites list page — card grid, create, edit, delete                             | Complete |
| API keys page — generate (copy-once reveal), list, revoke                     | Complete |
| Review queue — approve → publish, reject → archive                            | Complete |
| Activity feed — paginated, filterable by site/action/date                     | Complete |
| Content browser — table with status filter, inline edit modal, delete         | Complete |
| Assets media browser — grid view, upload, filter, delete, copy URL            | Complete |
| Site settings — name, URL, platform, content type CRUD                        | Complete |
| Theme overview — name, version, token/component counts, import, delete        | Complete |
| Design tokens editor — inline editing with color swatches, save               | Complete |
| Theme components list — with category badges, edit/delete                     | Complete |
| Component editor — template + CSS + props schema with live preview            | Complete |
| Shared API client module with auto-refresh on 401                             | Complete |
| Reusable UI components — Button, Badge, Modal, EmptyState, ErrorAlert, etc.   | Complete |
| Component tests                                                               | Complete |

---

### ✅ Phase 6 — Site Serving (SSR)

The NestJS server renders published content as complete HTML pages with full theme integration. Pages, content entries, navigation, and favicons are served at clean URLs.

| Task                                                                    | Status   |
| ----------------------------------------------------------------------- | -------- |
| `SiteServeModule` — server-side HTML rendering with theme injection     | Complete |
| Public routes at `/s/:siteId/...` — home, content types, entries, pages | Complete |
| Theme CSS injection — design tokens, raw CSS, component-scoped styles   | Complete |
| Component template rendering — `{{placeholder}}` substitution           | Complete |
| Semantic field fallback when no component assigned                      | Complete |
| Page rendering with multi-section composition                           | Complete |
| Homepage resolution — published page with `isHomepage` flag             | Complete |
| Navigation rendering — `menu_name='header'` items in page header        | Complete |
| Favicon injection — `<link rel="icon">` from uploaded favicon assets    | Complete |
| Font auto-download — remote font URLs rewritten to local `/assets/...`  | Complete |
| ETag-cached public theme endpoint                                       | Complete |
| Unit + integration tests for all rendering paths                        | Complete |

---

### ✅ Phase 7 — Asset Management

First-class file upload, storage abstraction, image optimization, and font handling.

| Task                                                                   | Status   |
| ---------------------------------------------------------------------- | -------- |
| `AssetsModule` — entity, service, controller, storage abstraction      | Complete |
| `AssetStorage` interface — swappable backends (local disk, future S3)  | Complete |
| `LocalAssetStorage` — writes to `ASSETS_DIR` (default `./uploads`)     | Complete |
| File upload endpoint — multipart/form-data, 10 MB limit, JWT-protected | Complete |
| Static asset serving — `GET /assets/:siteId/:assetId/:filename`        | Complete |
| Font auto-download — remote fonts on theme import → local storage      | Complete |
| GDPR-safe font serving — no external font requests from visitors       | Complete |
| Image optimization — sharp: WebP variants at 320/640/1280/1920px       | Complete |
| Variant metadata in `asset.variants` JSONB column                      | Complete |
| Favicon upload and auto-injection in served pages                      | Complete |
| MCP tools — `upload_asset`, `list_assets`, `delete_asset`              | Complete |
| Dashboard media browser — grid view, upload, filter, delete            | Complete |
| Unit tests for all asset operations                                    | Complete |

---

## Planned Phases

### 🔜 Phase 8 — Webhooks & Integrations

**Goal:** Notify external systems when content changes, enable build triggers and downstream sync.

| Task                                                                                                        | Scope        |
| ----------------------------------------------------------------------------------------------------------- | ------------ |
| Webhook configuration per site — URL, secret, event types                                                   | `server`     |
| Event system — entry.created, entry.updated, entry.published, entry.deleted, page.published, theme.imported | `server`     |
| Outbound HTTP delivery with retry and delivery log                                                          | `server`     |
| Webhook management page in dashboard                                                                        | `dashboard`  |
| MCP tools — `create_webhook`, `list_webhooks`, `delete_webhook`                                             | `server/mcp` |
| WordPress migration tool — import posts, pages, media from WordPress export                                 | `server`     |
| Shopify product sync — read/write product descriptions via Shopify Admin API                                | `server`     |

---

### 🔜 Phase 9 — Access Control & Multi-User

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

### 🔜 Phase 10 — Content Versioning & History

**Goal:** Track content revisions and support rollback.

| Task                                                         | Scope        |
| ------------------------------------------------------------ | ------------ |
| Content version entity — snapshot entry state on each update | `server`     |
| Version history endpoint — list versions for an entry        | `server`     |
| Rollback endpoint — restore entry to a previous version      | `server`     |
| Diff view — compare two versions side by side                | `dashboard`  |
| MCP tools — `list_entry_versions`, `restore_entry_version`   | `server/mcp` |

---

### 🔜 Phase 11 — Developer Experience

**Goal:** API documentation, SDKs, and improved onboarding.

| Task                                                 | Scope        |
| ---------------------------------------------------- | ------------ |
| OpenAPI/Swagger documentation for REST API           | `server`     |
| TypeScript SDK package for programmatic API access   | root package |
| API versioning strategy (URL-based or header-based)  | `server`     |
| Postman collection or OpenAPI spec for all endpoints | `docs`       |

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
                    ├── ✅ Phase 5 (Dashboard UI)
                    ├── ✅ Phase 6 (Site Serving SSR)
                    └── ✅ Phase 7 (Asset Management)

🔜 Phase 8 (Webhooks) ──depends on── ✅ Phase 3
🔜 Phase 9 (Access Control) ──depends on── ✅ Phase 2
🔜 Phase 10 (Versioning) ──depends on── ✅ Phase 3
🔜 Phase 11 (DX) ──depends on── ✅ Phase 3
🔜 Phase 12 (Chat Client) ──depends on── ✅ Phase 4
🔜 Phase 13 (Search) ──depends on── ✅ Phase 3
```

Phases 8–13 are independent of each other and can be worked on in any order.

---

## Next Steps (2026-06-14)

### Immediate — highest impact for production readiness

| #   | Task                              | Effort | Why                                                |
| --- | --------------------------------- | ------ | -------------------------------------------------- |
| 1   | **Webhooks** (Phase 8)            | Small  | Enables SSG rebuilds, CDN purging, downstream sync |
| 2   | **Content versioning** (Phase 10) | Large  | Major UX win for content editors                   |

### Near-term — polish and completeness

| #   | Task                                    | Effort |
| --- | --------------------------------------- | ------ |
| 3   | OpenAPI/Swagger docs (Phase 11)         | Small  |
| 4   | Full-text search (Phase 13)             | Medium |
| 5   | Role-based access enforcement (Phase 9) | Medium |

### Longer-term — major features

| #   | Task                              | Effort |
| --- | --------------------------------- | ------ |
| 6   | Agent chat interface (Phase 12)   | Large  |
| 7   | WordPress/Shopify migration tools | Large  |

---

## What Each Agent Session Should Know

When working on a phase:

1. Read [`docs/capabilities.md`](./capabilities.md) for business intent and current state.
2. Read `CLAUDE.md` for code standards, git workflow, and test requirements.
3. Read the existing module most relevant to the work (e.g. `server/src/modules/content-entries/` for content patterns).
4. Check open PRs (`gh pr list`) to avoid stepping on in-flight work.
