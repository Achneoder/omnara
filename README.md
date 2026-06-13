# omnara

**The AI-driven CMS** — built by AI, managed by AI.

omnara is a content management system designed from the ground up to be operated through AI agents. Content creation, updates, and organization happen through natural language via an MCP Server, while a human-friendly dashboard gives you visibility and control over the things that matter most.

---

## Overview

Most CMS platforms require you to log in, navigate a UI, and manually manage content. omnara flips that model: your AI agent talks directly to the MCP Server to create and manage content, and you interact with the dashboard only when you want to review what was created or configure settings you'd rather not hand off to an AI.

**Core components:**

| Component | Stack | Purpose |
|---|---|---|
| MCP Server | Node.js | Content API + MCP protocol endpoint |
| MCP Client | Svelte | AI agent interface for content operations |
| Dashboard | Svelte | Human interface for review, settings, and oversight |

---

## Architecture

```
AI Agent
   │
   ▼
MCP Client (Svelte)
   │  MCP Protocol
   ▼
MCP Server (Node.js)
   │  REST / GraphQL API
   ├──▶ Content Store
   └──▶ Dashboard (Svelte)
              │
              ▼
           Human Operator
```

The **MCP Server** is the core of omnara. It manages the content layer and exposes both an MCP endpoint (for AI agents) and a conventional API (for external integrations and the dashboard).

The **MCP Client** gives AI agents a structured interface to perform content operations — creating pages, updating copy, managing media, organizing taxonomies — without needing to understand the underlying data model.

The **Dashboard** is for humans. It lets you review AI-generated content before it goes live, manage sensitive settings (API keys, integrations, access control), and maintain oversight of what the AI is doing on your behalf.

---

## Features

- **AI-native content management** — manage all content through natural language via any MCP-compatible AI agent
- **MCP Server** — standards-based MCP protocol endpoint built on Node.js, designed for scale
- **Human oversight dashboard** — review, approve, and configure without exposing sensitive settings to AI agents
- **Universal CMS** — serve any kind of website: blogs, storefronts, landing pages, documentation sites, or fully custom builds
- **Headless API** — consume your content from any frontend via REST or GraphQL, the same way you would with WordPress, Shopify, or any other headless CMS
- **Drop-in compatibility** — built to be a backend for sites that would otherwise run on WordPress, Shopify, Wix, or similar platforms

---

## Getting Started

### Prerequisites

- Node.js 20+
- A running omnara MCP Server instance
- An MCP-compatible AI agent (e.g. Claude with MCP support)

### MCP Server

```bash
cd server
npm install
npm run dev
```

The server starts on `http://localhost:3000` by default. Configure your environment in `.env`:

```env
PORT=3000
DATABASE_URL=...
API_SECRET=...
```

### MCP Client

```bash
cd client
npm install
npm run dev
```

Point your MCP-compatible agent at the client endpoint to begin managing content.

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dashboard is available at `http://localhost:5173`. Use it to review AI-created content, manage integrations, and configure settings that should stay out of the AI's hands.

---

## Use Cases

- **Replace WordPress** — use omnara as a headless backend; let your AI agent write and publish posts while you review them in the dashboard
- **Headless storefront** — manage product copy, descriptions, and landing pages through an AI agent integrated into your workflow
- **Custom website backend** — build any frontend on top of omnara's API; the AI handles the content operations
- **Multi-site management** — one omnara instance can serve multiple sites, each managed independently by AI agents

---

## Project Structure

```
omnara/
├── server/        # MCP Server (Node.js)
├── client/        # MCP Client (Svelte)
├── dashboard/     # Management dashboard (Svelte)
└── docs/          # Documentation
```

---

## Roadmap

- [ ] MCP Server — core content API
- [ ] MCP Client — agent interface
- [ ] Dashboard — review and settings UI
- [ ] Plugin system for custom content types
- [ ] Multi-tenant support
- [ ] WordPress migration tool
- [ ] Shopify compatibility layer

---

## Contributing

omnara is in early development. Contributions, ideas, and feedback are welcome — open an issue or submit a pull request.

---

## License

MIT
