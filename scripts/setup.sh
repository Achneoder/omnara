#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
#  Color helpers
# ─────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[info]${RESET}  $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}==> $*${RESET}"; }

# ─────────────────────────────────────────────
#  Banner
# ─────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "  ┌─────────────────────────────────────┐"
echo "  │        omnara — local setup         │"
echo "  └─────────────────────────────────────┘"
echo -e "${RESET}"

# Resolve repo root relative to this script so it can be called from anywhere.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ─────────────────────────────────────────────
#  1. Prerequisites
# ─────────────────────────────────────────────
step "Checking prerequisites"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    success "$1 found ($(command -v "$1"))"
  else
    error "$1 is required but not installed."
    echo "       $2"
    exit 1
  fi
}

check_cmd docker         "Install Docker Desktop: https://docs.docker.com/get-docker/"
check_cmd "docker"       "Install Docker Desktop: https://docs.docker.com/get-docker/"

# Docker Compose v2 ships as a Docker CLI plugin (docker compose), not a standalone binary.
if docker compose version &>/dev/null 2>&1; then
  success "docker compose (v2) found"
else
  error "docker compose v2 is required but not available."
  echo "       Upgrade Docker Desktop or install the Compose plugin:"
  echo "       https://docs.docker.com/compose/install/"
  exit 1
fi

# Node.js >= 20
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    success "node v${NODE_VERSION}"
  else
    error "Node.js >= 20 is required (found v${NODE_VERSION})."
    echo "       Use nvm or fnm to install a newer version."
    exit 1
  fi
else
  error "node is required but not installed."
  echo "       https://nodejs.org/ or use nvm/fnm"
  exit 1
fi

check_cmd pnpm "Install pnpm: https://pnpm.io/installation"

# ─────────────────────────────────────────────
#  2. Environment files
# ─────────────────────────────────────────────
step "Setting up environment files"

copy_env() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [ -f "$dst" ]; then
    warn "${label} already exists — skipping (delete it to regenerate)"
  elif [ -f "$src" ]; then
    cp "$src" "$dst"
    success "Created ${label} from ${src}"
  else
    warn "${src} not found — skipping ${label}"
  fi
}

copy_env ".env.example"           ".env"           ".env (root)"
copy_env "server/.env.example"    "server/.env"    "server/.env"

# client/.env.example — create a minimal one if it doesn't exist yet.
if [ ! -f "client/.env.example" ]; then
  cat > "client/.env.example" <<'EOF'
VITE_API_URL=http://localhost:3000
EOF
  success "Created client/.env.example"
fi
copy_env "client/.env.example"    "client/.env"    "client/.env"

# dashboard/.env.example — same treatment.
if [ ! -f "dashboard/.env.example" ]; then
  cat > "dashboard/.env.example" <<'EOF'
VITE_API_URL=http://localhost:3000
EOF
  success "Created dashboard/.env.example"
fi
copy_env "dashboard/.env.example" "dashboard/.env" "dashboard/.env"

# ─────────────────────────────────────────────
#  3. Start infrastructure
# ─────────────────────────────────────────────
step "Starting PostgreSQL (docker compose)"

docker compose up -d

# ─────────────────────────────────────────────
#  4. Wait for Postgres to be healthy
# ─────────────────────────────────────────────
step "Waiting for PostgreSQL to be ready"

MAX_WAIT=30
ELAPSED=0
INTERVAL=2

while true; do
  STATUS=$(docker compose ps --format json postgres 2>/dev/null \
    | python3 -c "import sys,json; data=sys.stdin.read().strip(); rows=json.loads(data) if data.startswith('[') else [json.loads(l) for l in data.splitlines() if l]; print(rows[0].get('Health','') if rows else '')" 2>/dev/null || echo "")

  if [ "$STATUS" = "healthy" ]; then
    success "PostgreSQL is healthy"
    break
  fi

  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    error "PostgreSQL did not become healthy within ${MAX_WAIT}s."
    echo "       Check logs with: docker compose logs postgres"
    exit 1
  fi

  info "Waiting for PostgreSQL... (${ELAPSED}s elapsed)"
  sleep "$INTERVAL"
  ELAPSED=$((ELAPSED + INTERVAL))
done

# ─────────────────────────────────────────────
#  5. Install dependencies
# ─────────────────────────────────────────────
step "Installing pnpm workspace dependencies"

pnpm install

success "Dependencies installed"

# ─────────────────────────────────────────────
#  Done
# ─────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}Setup complete!${RESET}"
echo ""
echo -e "  ${BOLD}Start all services at once:${RESET}"
echo -e "    ${CYAN}pnpm dev${RESET}"
echo ""
echo -e "  ${BOLD}Or start each service individually:${RESET}"
echo -e "    ${CYAN}pnpm --filter @omnara/server start:dev${RESET}   → http://localhost:3000"
echo -e "    ${CYAN}pnpm --filter @omnara/client dev${RESET}          → http://localhost:5173"
echo -e "    ${CYAN}pnpm --filter @omnara/dashboard dev${RESET}       → http://localhost:5174"
echo ""
echo -e "  ${BOLD}Useful docker compose commands:${RESET}"
echo -e "    ${CYAN}docker compose ps${RESET}         — check service status"
echo -e "    ${CYAN}docker compose logs -f${RESET}    — tail logs"
echo -e "    ${CYAN}docker compose down${RESET}       — stop services"
echo -e "    ${CYAN}docker compose down -v${RESET}    — stop and delete data"
echo ""
