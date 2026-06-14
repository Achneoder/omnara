# omnara — Implementation Roadmap

Generated: 2026-06-14. Source of truth: [`docs/capabilities.md`](./capabilities.md).

---

## Current State (Baseline)

| Layer | What exists |
|---|---|
| Server bootstrap | NestJS app, health check endpoints, global pipes, throttler, exception filter |
| MCP transport | SSE (`GET /mcp/sse`) + message handler (`POST /mcp/messages`), in-memory session tracking |
| Auth module | JWT + refresh-token rotation, API-key guard scaffold, bcrypt password hashing |
| Database | MikroORM installed, `users` + `refresh_tokens` tables migrated |
| Dashboard | Placeholder `<h1>` page, no routing |
| MCP Client | Placeholder `<h1>` page, no routing |
| Storybook / UI | Scaffolded with design system primitives (Button, Card, Badge, Input, typography) |

Everything else described in `capabilities.md` is not started.

---

## Phases

### Phase 1 — Database Foundation
**Goal:** All core entities and relations exist in the DB before any feature work begins.  
**Dependencies:** None (builds on existing MikroORM setup).

| Task | Scope | Agent |
|---|---|---|
| `Site` entity — id, name, url, platform (enum: wordpress/shopify/custom), settings JSON, timestamps | `server` | `nestjs-backend-dev` |
| `ApiKey` entity — id, key_hash, label, site_id (FK), last_used_at, revoked_at, timestamps | `server` | `nestjs-backend-dev` |
| `ContentType` entity — id, site_id (FK), name, slug, field_schema (JSONB), timestamps | `server` | `nestjs-backend-dev` |
| `ContentEntry` entity — id, site_id (FK), content_type_id (FK), title, slug, body (JSONB), status (enum: draft/review/live/archived), published_at, author_session_id, timestamps | `server` | `nestjs-backend-dev` |
| `MediaReference` entity — id, content_entry_id (FK), url, alt_text, mime_type, timestamps | `server` | `nestjs-backend-dev` |
| `ActivityLog` entity — id, site_id (FK nullable), session_id, action (varchar), entity_type, entity_id, metadata (JSONB), created_at | `server` | `nestjs-backend-dev` |
| Migration bundling all new tables | `server` | `nestjs-backend-dev` |

**Done when:** `pnpm --filter server migration:up` succeeds with all tables present.

---

### Phase 2 — Site Management REST API
**Goal:** Sites can be created and managed via REST. Agents (and the dashboard) can scope operations to a site.  
**Dependencies:** Phase 1.

| Task | Scope | Agent |
|---|---|---|
| `SitesModule` — entity, service, controller, DTOs | `server` | `nestjs-backend-dev` |
| `GET /sites`, `POST /sites`, `GET /sites/:id`, `PATCH /sites/:id`, `DELETE /sites/:id` | `server` | `nestjs-backend-dev` |
| JWT guard applied to all site endpoints | `server` | `nestjs-backend-dev` |
| `ApiKeysModule` — generate, list, revoke API keys per site | `server` | `nestjs-backend-dev` |
| Unit + integration tests for sites and API keys | `server` | `nestjs-backend-dev` |

**Done when:** All endpoints return correct responses, tests pass.

---

### Phase 3 — Content REST API
**Goal:** Full CRUD for content types and entries available over REST, including draft → live workflow.  
**Dependencies:** Phase 2 (site FK required).

| Task | Scope | Agent |
|---|---|---|
| `ContentTypesModule` — entity, service, controller, DTOs | `server` | `nestjs-backend-dev` |
| `GET /sites/:siteId/content-types`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | `server` | `nestjs-backend-dev` |
| `ContentEntriesModule` — entity, service, controller, DTOs | `server` | `nestjs-backend-dev` |
| `GET /sites/:siteId/entries` (filterable by type, status, date), `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | `server` | `nestjs-backend-dev` |
| `POST /sites/:siteId/entries/:id/publish` and `/unpublish` | `server` | `nestjs-backend-dev` |
| `MediaReferencesModule` — attach/detach media to entries | `server` | `nestjs-backend-dev` |
| `ActivityLogModule` — service that records every mutation, `GET /activity` endpoint | `server` | `nestjs-backend-dev` |
| Interceptor or service hook wiring activity log to all write operations | `server` | `nestjs-backend-dev` |
| Unit + integration tests for all content endpoints | `server` | `nestjs-backend-dev` |

**Done when:** Full content lifecycle (create → draft → review → live → archived) works end-to-end via REST.

---

### Phase 4 — MCP Capabilities
**Goal:** Agents connecting over SSE can perform all content operations through MCP Tools, read site schema via Resources, and use guided Prompts for common workflows.  
**Dependencies:** Phase 3 (all REST services must exist to back the MCP tools).

| Task | Scope | Agent |
|---|---|---|
| API key validation in MCP session handshake | `server` | `nestjs-mcp-architect` |
| MCP Tool: `list_sites` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `list_content_types` (site-scoped) | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `create_content_entry` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `get_content_entry` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `update_content_entry` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `delete_content_entry` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `list_content_entries` (filterable) | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `publish_content_entry` / `unpublish_content_entry` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Tool: `attach_media` / `detach_media` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Resource: `site_schema` — exposes site config and content type definitions for active session | `server/mcp` | `nestjs-mcp-architect` |
| MCP Resource: `content_type:{slug}` — field schema for a specific content type | `server/mcp` | `nestjs-mcp-architect` |
| MCP Prompt: `create_blog_post` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Prompt: `update_product_description` | `server/mcp` | `nestjs-mcp-architect` |
| MCP Prompt: `review_and_publish` | `server/mcp` | `nestjs-mcp-architect` |
| Tool + Resource + Prompt tests (success + error paths) | `server/mcp` | `nestjs-mcp-architect` |

**Done when:** A Claude.ai agent can connect via SSE, authenticate with an API key, read the schema, and perform full content CRUD using only MCP calls.

---

### Phase 5 — Dashboard UI
**Goal:** Human operators can log in, inspect agent activity, review and approve/reject AI-created content, manage sites, and manage API keys.  
**Dependencies:** Phase 3 (REST API), Phase 2 (auth endpoints), design system primitives from Storybook.

| Task | Scope | Agent |
|---|---|---|
| SvelteKit routing scaffold — define all routes and layouts | `dashboard` | `svelte5-frontend-expert` |
| Auth flow — login page, session store, protected route guard | `dashboard` | `svelte5-frontend-expert` |
| Sites list page — list, create, edit, delete | `dashboard` | `svelte5-frontend-expert` |
| API keys page — per-site key generation, revoke | `dashboard` | `svelte5-frontend-expert` |
| Review queue page — list entries in `review` status, approve → `live` or reject → `archived` | `dashboard` | `svelte5-frontend-expert` |
| Activity feed page — paginated log, filterable by site/action/date | `dashboard` | `svelte5-frontend-expert` |
| Content browser page — list all entries, status filter, manual edit | `dashboard` | `svelte5-frontend-expert` |
| Per-site settings page — name, URL, platform, connected content types | `dashboard` | `svelte5-frontend-expert` |
| Shared API client module (`$lib/api`) | `dashboard` | `svelte5-frontend-expert` |
| Component tests for all pages (loading, error, empty, populated states) | `dashboard` | `svelte5-frontend-expert` |

**Done when:** All dashboard pages render real data, review queue approves/rejects correctly, tests pass.

---

### Phase 6 — MCP Client UI
**Goal:** Users who don't connect Claude.ai directly have a web-based agent chat interface with inline tool-call visibility and in-context publish controls.  
**Dependencies:** Phase 4 (MCP Tools must exist to show traces), Phase 1 (session identity).

| Task | Scope | Agent |
|---|---|---|
| SvelteKit routing scaffold — session list + chat view | `client` | `svelte5-frontend-expert` |
| Auth flow — login, protected routes | `client` | `svelte5-frontend-expert` |
| Chat session list — create, label, resume sessions | `client` | `svelte5-frontend-expert` |
| Chat view — message input, assistant response rendering | `client` | `svelte5-frontend-expert` |
| Tool-call trace component — expandable inline view of tool name, inputs, outputs | `client` | `svelte5-frontend-expert` |
| Draft preview card — renders content entry fields before publish | `client` | `svelte5-frontend-expert` |
| One-click publish button surfaced in draft preview | `client` | `svelte5-frontend-expert` |
| MCP over HTTP connection manager (`$lib/mcp`) | `client` | `svelte5-frontend-expert` |
| Component tests | `client` | `svelte5-frontend-expert` |

**Done when:** A user can open the client, start a chat session, watch the agent create content with visible tool traces, and publish from the UI.

---

## Dependency Graph

```
Phase 1 (DB entities)
    └── Phase 2 (Sites REST)
            └── Phase 3 (Content REST + Activity Log)
                    ├── Phase 4 (MCP Capabilities)
                    └── Phase 5 (Dashboard UI)
                                    └── [Phase 6 can start in parallel with Phase 5]
Phase 6 (MCP Client UI) ──depends on── Phase 4
```

---

## What Each Agent Session Needs to Know

Every agent session implementing a phase should:

1. Read this roadmap to understand what was completed before and what comes next.
2. Read `docs/capabilities.md` for business intent.
3. Read `CLAUDE.md` for code standards, git workflow, and test requirements.
4. Read the existing module most relevant to the work (e.g. `server/src/modules/auth/` for auth patterns).
5. Check open PRs (`gh pr list`) to avoid stepping on in-flight work.

---

## Completion Checklist

- [ ] Phase 1 — Database entities and migration
- [ ] Phase 2 — Site management REST API + API keys
- [ ] Phase 3 — Content REST API + activity log
- [ ] Phase 4 — MCP Tools, Resources, and Prompts
- [ ] Phase 5 — Dashboard UI
- [ ] Phase 6 — MCP Client UI
