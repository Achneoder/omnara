# omnara

**The AI-driven CMS** — built for AI, managed by AI.

omnara is a content management system designed from the ground up to be operated through AI agents. Content creation, updates, and organization happen through natural language via an MCP Server, while a human-friendly dashboard gives you visibility and control over the things that matter most.

---

## Overview

Most CMS platforms require you to log in, navigate a UI, and manually manage content. omnara flips that model: your AI agent talks directly to the MCP Server to create and manage content, and you interact with the dashboard only when you want to review what was created or configure settings you'd rather not hand off to an AI.

**Core components:**

| Component     | Stack                                       | Purpose                                                                           |
| ------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| MCP Server    | NestJS · TypeScript · PostgreSQL · MikroORM | Content API + MCP protocol endpoint                                               |
| MCP Client    | Svelte 5 · SvelteKit · TailwindCSS          | Headless content consumer — renders published content with theme-driven templates |
| Dashboard     | Svelte 5 · SvelteKit · TailwindCSS          | Human interface for review, settings, and oversight                               |
| Design System | Claude Design · Storybook · Svelte 5        | Component library and design tokens shared across all frontends                   |

---

## Architecture

```mermaid
flowchart TD
    A([AI Agent]) --> B[Claude.ai\nPro / Max / Teams]
    A --> C[MCP Client\nSvelte 5 + SvelteKit]

    B -- MCP Protocol\nHTTPS --> S
    C -- MCP Protocol\nstdio / HTTP --> S

    S[MCP Server\nNestJS + TypeScript]

    S --> DB[(PostgreSQL\ncontent store)]
    S -- REST API --> D[Dashboard\nSvelte 5 + SvelteKit]
    S -- Public API --> E[External Frontends\nWebsites / Apps]

    D --> H([Human Operator])
```

The **MCP Server** is the core of omnara. It's a NestJS application backed by PostgreSQL (via MikroORM) that exposes both an MCP endpoint for AI agents and a REST API for the dashboard. It handles content, sites, themes, authentication, and all write operations.

The **MCP Client** is a Svelte 5 frontend that consumes published content from the public API. It renders content entries using theme-driven templates — HTML components with `{{placeholder}}` syntax, scoped CSS, and design tokens injected at runtime. It demonstrates how any frontend can be built on top of omnara's headless API.

The **Dashboard** is for humans. It shows AI activity in real time, surfaces content that needs review before going live, and manages sensitive settings (API keys, theme configuration, access control) that should stay out of the AI's hands.

---

## Features

### AI-Native Content Management

- **19 MCP Tools** — AI agents can list, create, update, delete, publish, and unpublish content; attach media; manage themes and components; all through natural language
- **4 MCP Resources** — agents read site schema, content type definitions, and theme documents to understand the data model before acting
- **3 MCP Prompts** — guided workflows for common tasks: creating blog posts, updating product descriptions, and reviewing/publishing content
- Connect any MCP-compatible agent, including Claude.ai (Pro, Max, and Teams plans)

### Content Lifecycle

- **4-stage workflow**: draft → review → live → archived
- Explicit publish/unpublish operations with timestamps
- Content entries store flexible JSON body structures defined per content type
- Filterable by status, type, and date range

### Multi-Site Support

- Manage multiple sites (WordPress, Shopify, custom) from a single omnara instance
- Each site has isolated content, content types, API keys, and theme configuration
- Agents scope operations to a specific site per session

### Theme & Design System

- **Design tokens** — CSS custom properties for colors, typography, spacing, radii, shadows, and motion; light and dark mode support
- **Theme components** — HTML templates with `{{placeholder}}` syntax, scoped CSS, and props schemas mapping placeholders to content body fields
- **Component-to-content-type assignment** — each content type can be linked to a theme component for automated rendering
- **Atomic theme import** — import a full theme (tokens + components + CSS) as a single JSON payload
- **ETag-cached public delivery** — themes served with conditional caching for efficient updates

### Human Oversight Dashboard

- **Review queue** — approve (publish) or reject (archive) AI-created content before it goes live
- **Content browser** — list, filter, edit, and delete content entries across all statuses
- **Activity feed** — paginated, filterable audit trail of every agent action
- **Site management** — create, configure, and delete sites; manage content types per site
- **API key management** — generate, list, and revoke per-site API keys for agent access
- **Theme editor** — edit design tokens inline, manage components with live preview, import/export themes via JSON

### Authentication & Security

- **JWT authentication** — access tokens with configurable expiry, refresh token rotation with theft detection
- **API key authentication** — per-site keys for MCP/programmatic access, stored as Argon2 hashes
- **Account lockout** — 5 failed attempts triggers a 15-minute lock
- **Rate limiting** — global throttling (100 req/60s) with stricter limits on auth endpoints
- **Security headers** — Helmet, CORS restrictions, request body size limits

### Site Serving (SSR)

- Server-side rendered HTML pages for every managed site
- Full theme integration — design tokens, raw CSS, and component-scoped styles injected into every page
- Component template rendering with `{{placeholder}}` syntax and semantic field fallback
- Public routes at `/s/:siteId/...` — home pages, content type listings, and entry detail pages
- No authentication required — built for end-user traffic

### Headless Public API

- Unauthenticated JSON endpoints for consuming published content and themes
- ETag-based caching for theme delivery
- List published entries filtered by content type
- Built to power any frontend — websites, mobile apps, static site generators

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ (or Docker)

### Quick Setup

```bash
bash scripts/setup.sh
```

This provisions everything: checks prerequisites, starts PostgreSQL via Docker, installs dependencies, and runs database migrations.

### Start All Services

```bash
pnpm dev
```

| Service               | URL                   |
| --------------------- | --------------------- |
| API (NestJS)          | http://localhost:3000 |
| Client (SvelteKit)    | http://localhost:5173 |
| Dashboard (SvelteKit) | http://localhost:5174 |
| Storybook (UI)        | http://localhost:6006 |

### Manual Setup

```bash
pnpm install
```

**MCP Server:**

```bash
pnpm --filter server dev
```

Configure your environment in `server/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/omnara
JWT_SECRET=your-secret-here
```

**MCP Client:**

```bash
pnpm --filter client dev
```

The client starts on `http://localhost:5173`. It renders published content using the site's theme.

**Dashboard:**

```bash
pnpm --filter dashboard dev
```

The dashboard is available at `http://localhost:5174`. Log in to review AI-created content, manage sites, and configure themes.

### Using Claude.ai as the MCP Client

If you have a Claude.ai **Pro, Max, or Teams** subscription, you can connect Claude.ai directly to the omnara MCP Server:

1. Make your MCP Server accessible over HTTPS (for local development, use a tunnel such as [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) or [ngrok](https://ngrok.com))
2. In Claude.ai, go to **Settings → Integrations** and add your omnara server URL as a new MCP server
3. Claude.ai will discover the available tools and you can start managing content directly from the chat interface

---

## Use Cases

- **Replace WordPress** — use omnara as a headless backend; let your AI agent write and publish posts while you review them in the dashboard
- **Headless storefront** — manage product copy, descriptions, and landing pages through an AI agent integrated into your workflow
- **Custom website backend** — build any frontend on top of omnara's public API; the AI handles the content operations
- **Multi-site management** — one omnara instance can serve multiple sites, each with its own theme, content types, and API keys

---

## Project Structure

```
omnara/
├── server/             # NestJS MCP Server
│   └── src/
│       ├── modules/    # Feature modules (auth, sites, content, themes, mcp, …)
│       └── main.ts
├── client/             # SvelteKit MCP Client (headless content consumer)
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only)
│       └── lib/        # API client, theme injection, template renderer
├── dashboard/          # SvelteKit Management Dashboard
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only, auth-protected)
│       └── lib/        # API client, auth store, UI components
├── ui/                 # Storybook component library (design system primitives)
├── design/             # Claude Design System (tokens, components, UI kits, brand)
├── docs/               # Documentation (capabilities, roadmap, setup guides)
└── scripts/            # Provisioning and utility scripts
```

---

## Development

This repo uses **pnpm workspaces**. Common commands:

```bash
pnpm install                          # install all workspace dependencies
pnpm --filter server add <pkg>        # add a dependency to a specific package
pnpm --filter dashboard dev           # run a dev server for a specific package
pnpm -r test                          # run tests across all packages
pnpm -r build                         # build all packages
pnpm storybook                        # start Storybook for UI components
```

---

## Documentation

- **[Capabilities](docs/capabilities.md)** — detailed breakdown of every feature area and its implementation status
- **[Roadmap](docs/roadmap.md)** — completed phases and planned future work
- **[Local Development](docs/local-development.md)** — full setup guide, environment variables, and troubleshooting
- **[MCP Connection](docs/mcp-connection.md)** — guide for connecting AI agents to the MCP server

---

## Contributing

omnara is in active development. Contributions, ideas, and feedback are welcome — open an issue or submit a pull request.

---

## License

MIT
