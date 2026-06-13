# omnara — Business Capabilities

This document describes what omnara is built to do and the current implementation state of each capability area. It is the authoritative reference for understanding the system's business scope.

---

## What omnara Does

omnara is a headless CMS where AI agents are the primary operators. Instead of a human navigating a UI to write and publish content, an AI agent talks directly to the MCP Server using natural language and structured tool calls. Humans interact with a separate dashboard to review output, approve changes, and manage configuration that should not be delegated to an AI.

---

## Capability Areas

### 1. Content Management (via MCP)

AI agents create, update, organize, and publish content through MCP Tools exposed by the server. The agent reads site schema and content type definitions from MCP Resources, then issues tool calls to manage content.

**Intended scope:**
- Create, read, update, and delete content entries
- List and filter content by site, type, status, and date
- Publish or unpublish content (draft → live workflow)
- Attach media references to content entries
- Manage content types and field schemas

**Current state:** Not implemented. The MCP Server boots and accepts SSE connections but `registerCapabilities()` is empty — no Tools, Resources, or Prompts are exposed.

---

### 2. Multi-site Support

A single omnara instance manages multiple sites. Each site is isolated: it has its own content, schema, and settings. Agents scope their operations to a specific site per session.

**Intended scope:**
- Register and configure connected sites (WordPress, Shopify, custom)
- Isolate content and settings per site
- Let agents switch between sites within a session

**Current state:** Not implemented. No site entity or API exists.

---

### 3. Human Review and Oversight (Dashboard)

The dashboard is the human control surface. It does not replace the AI — it lets operators stay informed and intervene when needed.

**Intended scope:**
- Review queue: content created by AI that hasn't been approved yet
- Activity feed: real-time log of agent actions (what was created, updated, published, and by which session)
- Approve or reject AI-created content before it goes live
- Manage API keys, site integrations, and access settings
- Per-site configuration that agents are not permitted to change

**Current state:** Not implemented. The dashboard is a placeholder `<h1>` page with no routing, data fetching, or components.

---

### 4. MCP Client (Agent Chat Interface)

The MCP Client is an optional standalone web interface for AI agents. Users who don't connect Claude.ai directly use it as a chat environment with built-in tool-call visibility.

**Intended scope:**
- Persistent, labeled chat sessions
- Inline display of tool-call traces (what the agent did and why)
- Draft preview cards showing content before it's published
- One-click publish controls surfaced in-context
- Connects to the MCP Server over stdio or HTTP

**Current state:** Not implemented. The client is a placeholder `<h1>` page.

---

### 5. MCP Protocol Layer

The MCP Server exposes a standards-compliant MCP endpoint that any MCP-compatible agent — including Claude.ai Pro, Max, and Teams — can connect to directly.

**Intended scope:**
- SSE transport for remote agent connections (Claude.ai)
- stdio transport for local agent connections (MCP Client)
- Tools for all content operations
- Resources exposing site schema and content type definitions
- Prompts for common content workflows

**Current state:** Transport layer is implemented and functional.

| Piece | Status |
|---|---|
| SSE transport (`GET /mcp/sse`) | Working |
| Message handler (`POST /mcp/messages`) | Working |
| Session tracking (in-memory) | Working |
| MCP Tools | Not implemented |
| MCP Resources | Not implemented |
| MCP Prompts | Not implemented |

---

### 6. REST API (Dashboard + External Consumers)

The same NestJS server exposes a REST API used by the dashboard and available to any external frontend or integration.

**Intended scope:**
- CRUD endpoints for all content entities
- Site management endpoints
- Authentication endpoints (API key + JWT)
- Activity log endpoint

**Current state:** Only health check endpoints exist (`GET /` and `GET /health`).

---

### 7. Authentication and Access Control

**Intended scope:**
- API key auth for agent (MCP) connections
- JWT auth for the dashboard
- Per-site permission scoping

**Current state:** Not implemented.

---

### 8. Database Layer

PostgreSQL via MikroORM.

**Intended scope:** Entities for content entries, content types, sites, users, media references, sessions, and activity logs.

**Current state:** No entities, no migrations, MikroORM not installed.

---

## Implementation Summary

| Capability | Status |
|---|---|
| Server bootstrap and health checks | Complete |
| MCP SSE/HTTP transport | Complete |
| MCP Tools (content operations) | Not started |
| MCP Resources (schema, types) | Not started |
| MCP Prompts | Not started |
| Content API (REST) | Not started |
| Multi-site support | Not started |
| Authentication (API key + JWT) | Not started |
| Database entities and migrations | Not started |
| Human review queue (Dashboard) | Not started |
| Activity feed (Dashboard) | Not started |
| Agent chat interface (Client) | Not started |
| Design system integration | Not started |
