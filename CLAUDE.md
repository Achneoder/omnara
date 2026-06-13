# omnara — Claude Code Guide

## Project Overview

omnara is an AI-driven CMS built to be operated through AI agents. Content creation and management happen via an MCP Server, while human operators interact through a dashboard for review and configuration.

**Components:**

| Directory | Stack | Purpose |
|---|---|---|
| `server/` | NestJS + TypeScript + PostgreSQL + MikroORM | MCP Server — content API and MCP protocol endpoint |
| `client/` | Svelte 5 + SvelteKit + TailwindCSS | MCP Client — agent interface for content operations |
| `dashboard/` | Svelte 5 + SvelteKit + TailwindCSS | Human dashboard — review, settings, oversight |

---

## Technology Stack

### Backend (`server/`)

- **Framework**: NestJS (feature-module structure)
- **Language**: TypeScript (strict mode, no `any`)
- **Database**: PostgreSQL via MikroORM
- **Validation**: `class-validator` + `class-transformer` with global `ValidationPipe`
- **MCP**: `@modelcontextprotocol/sdk` integrated via NestJS providers
- **Testing**: Jest + `@nestjs/testing`

### Frontend (`client/`, `dashboard/`)

- **Framework**: Svelte 5 with SvelteKit (routing and load functions only — no server-side routes, no server actions, no SSR endpoints)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Testing**: Vitest + Svelte Testing Library

---

## Agents

Use these specialized agents for their respective domains:

- **`nestjs-backend-dev`** — NestJS controllers/services/modules, MikroORM entities and migrations, PostgreSQL queries, backend code review
- **`nestjs-mcp-architect`** — MCP Server design, Tool/Resource/Prompt definitions, MCP protocol integration, agent-friendly API design
- **`svelte5-frontend-expert`** — Svelte 5 components (Runes API), TailwindCSS, design system, UX decisions
- **`system-architect`** — Architecture decisions, technology stack evaluation, security review, cross-cutting concerns

---

## Git Workflow

Every change — no matter how small — follows this process:

### 1. Create a dedicated branch

Branch off from `main`. Use the format `<type>/<short-description>`:

```bash
git checkout main && git pull
git checkout -b feat/content-api-pagination
```

Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

### 2. Code and commit

Make your changes. Commit following **Conventional Commits**:

```
<type>(<scope>): <short imperative summary>

[optional body — explain WHY, not WHAT]
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`

**Scopes**: `server`, `client`, `dashboard`, `mcp`, `db`, `auth`, `config`

Examples:

```
feat(server): add pagination to content list endpoint
fix(dashboard): correct empty state on first load
test(server): add integration tests for content service
chore(config): update MikroORM to v6.4
```

Rules:
- One logical change per commit
- Keep the subject line under 72 characters
- Use the imperative mood ("add", "fix", "remove" — not "added", "fixes")
- Never commit `.env` files or secrets

### 3. Push and open a pull request

```bash
git push -u origin <branch-name>
gh pr create --title "<type>(<scope>): <summary>" --body "..."
```

**PR description must include:**

- **What**: One sentence on what changed
- **Why**: The motivation or problem being solved
- **How**: Any non-obvious implementation decisions
- **Test plan**: How to verify the change works (checklist)
- **Screenshots** (for frontend changes)

No PR merges without passing tests and a meaningful description.

---

## Testing Requirements

All code must be covered by tests. Tests are not optional.

### Backend (`server/`)

- **Unit tests**: Services and utilities tested in isolation with mocked dependencies
- **Integration tests**: Controllers and database interactions tested with `@nestjs/testing` and a real test database — do not mock the database layer
- **MCP tool tests**: Each Tool, Resource, and Prompt handler must have tests covering success and error paths
- File convention: `*.spec.ts` co-located with the source file
- Run: `npm test` (watch: `npm run test:watch`, coverage: `npm run test:cov`)

### Frontend (`client/`, `dashboard/`)

- **Component tests**: Every non-trivial component has tests for its interactive states (loading, error, empty, populated)
- **Accessibility**: Interactive elements must be keyboard-navigable and have proper ARIA attributes
- File convention: `*.test.ts` co-located with the component
- Run: `npm test`

### Coverage

- Aim for meaningful coverage of business logic — coverage theatre (testing getters to hit a number) is not acceptable
- New features require new tests in the same PR
- Bug fixes require a regression test

---

## Code Standards

### General

- No comments that explain *what* the code does — name things clearly instead
- Comments only for non-obvious *why*: hidden constraints, workarounds, subtle invariants
- No dead code, no `TODO` comments committed to `main`
- No hardcoded secrets or environment-specific values — use `@nestjs/config` on the backend, environment variables on the frontend

### Backend

- Controllers are thin: route handling and DTO mapping only; business logic lives in services
- All public methods on services have explicit return types
- Validate all inputs at the controller boundary with DTOs + `class-validator`
- MikroORM: always `flush()` after mutations; avoid N+1 via `populate`; use `em.transactional()` for multi-step writes
- MCP tool descriptions must be detailed enough for an LLM to understand and invoke them correctly without additional context

### Frontend

- Use Svelte 5 Runes exclusively (`$state`, `$derived`, `$effect`, `$props`) — no legacy `$:` reactive declarations
- SvelteKit is permitted for routing and `load` functions only — no `+server.ts` files, no form actions, no SSR data fetching that runs server-side
- All components handle every UI state explicitly: loading, error, empty, and populated
- No inline styles — TailwindCSS classes only (CSS variables for dynamic theming are acceptable)
- All props typed with TypeScript interfaces

---

## Project Structure

```
omnara/
├── server/             # NestJS MCP Server
│   └── src/
│       ├── modules/    # Feature modules (content, auth, ...)
│       └── main.ts
├── client/             # SvelteKit MCP Client
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only)
│       └── lib/
├── dashboard/          # SvelteKit Dashboard
│   └── src/
│       ├── routes/     # SvelteKit pages (client-only)
│       └── lib/
└── docs/
```
