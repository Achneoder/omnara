# Local Development

This guide covers everything you need to run the full omnara stack on your local machine.

---

## Prerequisites

| Tool                                               | Version                           | Install                                                                   |
| -------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| Docker Desktop (or Docker Engine + Compose plugin) | Latest                            | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)         |
| Docker Compose                                     | v2 (CLI plugin, `docker compose`) | Bundled with Docker Desktop                                               |
| Node.js                                            | >= 20                             | [nodejs.org](https://nodejs.org/) or [fnm](https://github.com/Schniz/fnm) |
| pnpm                                               | 11.6.0                            | `npm install -g pnpm@11.6.0`                                              |

> **Note:** Docker Compose v2 ships as a CLI plugin (`docker compose`), not the legacy standalone `docker-compose` binary. The setup script checks for the plugin form.

---

## Quick Start

Run the provisioning script from the repo root:

```bash
bash scripts/setup.sh
```

That's all you need. The script handles everything and prints next steps when it finishes.

---

## What the Script Does

1. **Checks prerequisites** — verifies docker, docker compose v2, node >= 20, and pnpm are installed.
2. **Copies `.env` files** — copies each `.env.example` to `.env` if a `.env` does not already exist:
   - `.env.example` → `.env` (root, used by docker compose for variable substitution)
   - `server/.env.example` → `server/.env`
   - `client/.env.example` → `client/.env` (creates the example file first if missing)
   - `dashboard/.env.example` → `dashboard/.env` (creates the example file first if missing)
3. **Starts infrastructure** — runs `docker compose up -d` to bring up PostgreSQL.
4. **Waits for PostgreSQL** — polls the container health status for up to 30 seconds.
5. **Installs dependencies** — runs `pnpm install` at the workspace root.

---

## Starting the Services

After setup, start everything in one terminal:

```bash
pnpm dev
```

Or start each service in a separate terminal for cleaner logs:

```bash
# Terminal 1 — NestJS API
pnpm --filter @omnara/server start:dev

# Terminal 2 — SvelteKit MCP Client
pnpm --filter @omnara/client dev

# Terminal 3 — SvelteKit Dashboard
pnpm --filter @omnara/dashboard dev
```

| Service               | URL                             |
| --------------------- | ------------------------------- |
| API (NestJS)          | http://localhost:3000           |
| Client (SvelteKit)    | http://localhost:5173           |
| Dashboard (SvelteKit) | http://localhost:5174           |
| Served Sites          | http://localhost:3000/s/:siteId |

---

## Environment Variables Reference

### Root `.env` (docker compose variable substitution)

| Variable      | Default     | Description                                 |
| ------------- | ----------- | ------------------------------------------- |
| `DB_HOST`     | `localhost` | PostgreSQL host                             |
| `DB_PORT`     | `5432`      | PostgreSQL port (also the host-mapped port) |
| `DB_USER`     | `omnara`    | PostgreSQL user                             |
| `DB_PASSWORD` | `omnara`    | PostgreSQL password                         |
| `DB_NAME`     | `omnara`    | PostgreSQL database name                    |

### `server/.env`

| Variable        | Default                                            | Description                                          |
| --------------- | -------------------------------------------------- | ---------------------------------------------------- |
| `PORT`          | `3000`                                             | HTTP port the NestJS server listens on               |
| `NODE_ENV`      | `development`                                      | Node environment                                     |
| `CLIENT_URL`    | `http://localhost:5173`                            | Allowed CORS origin for the client                   |
| `DASHBOARD_URL` | `http://localhost:5174`                            | Allowed CORS origin for the dashboard                |
| `DATABASE_URL`  | `postgresql://omnara:omnara@localhost:5432/omnara` | Full PostgreSQL connection string (used by MikroORM) |
| `DB_HOST`       | `localhost`                                        | PostgreSQL host                                      |
| `DB_PORT`       | `5432`                                             | PostgreSQL port                                      |
| `DB_USER`       | `omnara`                                           | PostgreSQL user                                      |
| `DB_PASSWORD`   | `omnara`                                           | PostgreSQL password                                  |
| `DB_NAME`       | `omnara`                                           | PostgreSQL database name                             |

### `client/.env` and `dashboard/.env`

| Variable       | Default                 | Description                |
| -------------- | ----------------------- | -------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the NestJS API |

> Vite only exposes variables prefixed with `VITE_` to the browser bundle.

---

## Docker Compose Commands

```bash
# Check running services and their health status
docker compose ps

# View live logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f postgres

# Stop services (keeps data volumes)
docker compose down

# Stop services and delete all data (fresh database on next up)
docker compose down -v

# Restart a single service
docker compose restart postgres

# Connect to the database with psql
docker compose exec postgres psql -U omnara -d omnara
```

---

## Running Tests

```bash
# Run all tests across every workspace package
pnpm -r test

# Run server tests only
pnpm --filter @omnara/server test

# Run server tests in watch mode
pnpm --filter @omnara/server test:watch

# Run server tests with coverage
pnpm --filter @omnara/server test:cov

# Run client tests
pnpm --filter @omnara/client test

# Run dashboard tests
pnpm --filter @omnara/dashboard test
```

> Server integration tests require PostgreSQL to be running. Always run `docker compose up -d` before running server tests.

---

## Troubleshooting

### `docker compose up` fails with "port already in use"

Something else is using port 5432. Either stop the conflicting process or change `DB_PORT` in `.env` to a free port (e.g. `5433`). Note that the `server/.env` `DATABASE_URL` and `DB_PORT` must match.

### PostgreSQL health check keeps timing out

Check the container logs for startup errors:

```bash
docker compose logs postgres
```

Common causes: conflicting volume from a previous install with different credentials, or insufficient Docker resource limits.

### `pnpm install` fails with workspace resolution errors

Make sure you are running pnpm 11.6.0. Check with `pnpm --version` and reinstall if needed:

```bash
npm install -g pnpm@11.6.0
```

### `nest start --watch` crashes immediately

The server requires a running PostgreSQL instance. Verify the container is healthy:

```bash
docker compose ps
```

Also confirm `server/.env` exists with the correct database credentials.

### Changes to `.env` are not picked up

Vite reads `.env` files at dev-server startup. Restart the dev server after modifying `.env` files. NestJS with `--watch` also reads env at startup, so restart the process.

### Resetting to a clean state

To wipe all local state and start fresh:

```bash
docker compose down -v   # remove containers and data volumes
rm -f .env server/.env client/.env dashboard/.env
bash scripts/setup.sh    # re-provision from scratch
```
