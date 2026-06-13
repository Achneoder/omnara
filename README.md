# omnara

**The AI-driven CMS** — built by AI, managed by AI.

omnara is a content management system designed from the ground up to be operated through AI agents. Content creation, updates, and organization happen through natural language via an MCP Server, while a human-friendly dashboard gives you visibility and control over the things that matter most.

---

## Overview

Most CMS platforms require you to log in, navigate a UI, and manually manage content. omnara flips that model: your AI agent talks directly to the MCP Server to create and manage content, and you interact with the dashboard only when you want to review what was created or configure settings you'd rather not hand off to an AI.

**Core components:**

| Component | Stack | Purpose |
|---|---|---|
| MCP Server | NestJS · TypeScript · PostgreSQL · MikroORM | Content API + MCP protocol endpoint |
| MCP Client | Svelte 5 · SvelteKit · TailwindCSS | Standalone AI agent interface for content operations |
| Dashboard | Svelte 5 · SvelteKit · TailwindCSS | Human interface for review, settings, and oversight |

---

## Architecture

```
AI Agent (Claude.ai / any MCP-compatible client)
   │
   ├── Claude.ai (Pro / Max / Teams) ──────────────────┐
   │        MCP Protocol (HTTPS)                       │
   │                                                   │
   └── MCP Client (Svelte 5 + SvelteKit)               │
            │  MCP Protocol (stdio / HTTP)              │
            ▼                                           │
       MCP Server (NestJS + PostgreSQL)  ◀──────────────┘
            │
            ├──▶ PostgreSQL (content store)
            │
            └──▶ REST API
                     │
                     ▼
               Dashboard (Svelte 5 + SvelteKit)
                     │
                     ▼
               Human Operator
```

The **MCP Server** is the core of omnara. It's a NestJS application backed by PostgreSQL (via MikroORM) that exposes both an MCP endpoint for AI agents and a REST API for the dashboard. It manages content, sites, and all write operations.

The **MCP Client** is a Svelte 5 chat interface that connects directly to the MCP Server. It gives AI agents a structured environment for content operations — creating pages, updating copy, managing media, organizing taxonomies — with inline draft previews and publish controls. It is optional for users who connect Claude.ai directly.

The **Dashboard** is for humans. It shows AI activity in real time, surfaces content that needs review before going live, and manages sensitive settings (API keys, integrations, access control) that should stay out of the AI's hands.

---

## Features

- **AI-native content management** — manage all content through natural language via any MCP-compatible AI agent, including Claude.ai (Pro, Max, and Teams plans)
- **MCP Server** — standards-based MCP protocol endpoint built on NestJS, exposing Tools, Resources, and Prompts to AI agents
- **Human oversight dashboard** — review queue, activity feed, and per-site controls; approve or request changes before content goes live
- **MCP Client** — chat interface with inline tool-call traces, draft cards, and one-click publish; sessions are persistent and labeled
- **Multi-site support** — connect multiple sites (Shopify, WordPress, custom) to a single omnara instance; each managed independently by AI agents
- **Headless REST API** — consume content from any frontend; same API powers the dashboard and external integrations
- **Design system** — omnara ships its own component library (`design/`) used across both Svelte frontends

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

### Install all workspace dependencies

```bash
pnpm install
```

### MCP Server

```bash
pnpm --filter server dev
```

The server starts on `http://localhost:3000` by default. Configure your environment in `server/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/omnara
API_SECRET=your-secret-here
```

### MCP Client

```bash
pnpm --filter client dev
```

The client starts on `http://localhost:5174`. Point your MCP-compatible agent at the client endpoint to begin managing content.

### Dashboard

```bash
pnpm --filter dashboard dev
```

The dashboard is available at `http://localhost:5173`. Use it to review AI-created content, manage connected sites, and configure settings.

### Using Claude.ai as the MCP Client

If you have a Claude.ai **Pro, Max, or Teams** subscription, you can skip the MCP Client entirely and connect Claude.ai directly to the omnara MCP Server:

1. Make your MCP Server accessible over HTTPS (for local development, use a tunnel such as [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) or [ngrok](https://ngrok.com))
2. In Claude.ai, go to **Settings → Integrations** and add your omnara server URL as a new MCP server
3. Claude.ai will discover the available tools and you can start managing content directly from the chat interface

---

## Use Cases

- **Replace WordPress** — use omnara as a headless backend; let your AI agent write and publish posts while you review them in the dashboard
- **Headless storefront** — manage product copy, descriptions, and landing pages through an AI agent integrated into your workflow
- **Custom website backend** — build any frontend on top of omnara's REST API; the AI handles the content operations
- **Multi-site management** — one omnara instance can serve multiple sites, each managed independently by AI agents

---

## Project Structure

```
omnara/
├── server/             # NestJS MCP Server
│   └── src/
│       ├── modules/    # Feature modules (content, auth, sites, …)
│       └── main.ts
├── client/             # SvelteKit MCP Client (agent chat interface)
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only)
│       └── lib/
├── dashboard/          # SvelteKit Management Dashboard
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only)
│       └── lib/
├── design/             # omnara Design System (component library + UI kits)
└── docs/
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
```

---

## Roadmap

- [ ] MCP Server — core content API (NestJS + MikroORM)
- [ ] MCP Tools — create, update, delete, list, publish content
- [ ] MCP Resources — site schema, content type definitions
- [ ] MCP Client — agent chat interface with session management
- [ ] Dashboard — review queue, activity feed, site management
- [ ] Authentication — API key and JWT-based auth
- [ ] Multi-site support
- [ ] WordPress migration tool
- [ ] Shopify compatibility layer

---

## Contributing

omnara is in early development. Contributions, ideas, and feedback are welcome — open an issue or submit a pull request.

---

## License

MIT
