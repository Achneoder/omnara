# Connecting to the MCP Server

This guide explains how to connect an MCP-compatible AI agent to the omnara MCP Server running locally.

---

## Transport

The MCP Server uses the **SSE (Server-Sent Events) transport** — the standard HTTP-based transport for remote MCP connections. Two endpoints are involved:

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /mcp/sse` | SSE stream | Open a session; the server streams events to the client |
| `POST /mcp/messages?sessionId=<id>` | HTTP POST | Send messages to an active session |

When a client connects to `/mcp/sse`, the server assigns a `sessionId` and streams it back. Subsequent tool calls are posted to `/mcp/messages` with that `sessionId`.

---

## Authentication

All MCP endpoints require an **API key** passed in the `x-api-key` HTTP header.

### Getting an API key

API keys are scoped to a site and are managed through the REST API (requires JWT authentication):

```bash
# 1. Log in to get a JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin"}'

# 2. Create an API key for a site
curl -X POST http://localhost:3000/sites/<siteId>/api-keys \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"label": "local-dev"}'
```

The response contains the raw key — copy it now, it is not shown again:

```json
{
  "id": "uuid",
  "name": "local-dev",
  "key": "ok_...",
  "siteId": "uuid",
  "createdAt": "2026-06-14T00:00:00.000Z"
}
```

### Dev fallback

During local development you can skip the REST API entirely by setting `MCP_API_KEY` in `server/.env`. Any request carrying that exact value in `x-api-key` will be accepted without a database lookup — but note that no site context will be associated with the session.

```env
MCP_API_KEY=dev-secret
```

---

## MCP Client Config

### Claude Desktop (`claude_desktop_config.json`)

Claude Desktop supports remote MCP servers via the `url` transport type. Add the following entry to your config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "omnara": {
      "url": "http://localhost:3000/mcp/sse",
      "headers": {
        "x-api-key": "your-api-key-here"
      }
    }
  }
}
```

### Claude Code (`.claude/mcp.json` or `claude mcp add`)

```bash
claude mcp add omnara \
  --transport sse \
  --url http://localhost:3000/mcp/sse \
  --header "x-api-key: your-api-key-here"
```

Or add it manually to `.claude/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "omnara": {
      "type": "sse",
      "url": "http://localhost:3000/mcp/sse",
      "headers": {
        "x-api-key": "your-api-key-here"
      }
    }
  }
}
```

### Claude.ai (Pro / Max / Teams)

Claude.ai requires the MCP Server to be reachable over HTTPS. For local development, expose it with a tunnel first:

```bash
# Using Cloudflare Tunnel (no account required for temporary tunnels)
cloudflared tunnel --url http://localhost:3000

# Using ngrok
ngrok http 3000
```

Then in Claude.ai go to **Settings → Integrations → Add Integration** and enter:

- **URL:** `https://<your-tunnel-url>/mcp/sse`
- **Headers:** `x-api-key: your-api-key-here`

---

## Verifying the Connection

With the server running (`pnpm --filter @omnara/server start:dev`), test the SSE endpoint directly:

```bash
curl -N http://localhost:3000/mcp/sse \
  -H "x-api-key: your-api-key-here"
```

A successful connection streams an event immediately:

```
event: endpoint
data: /mcp/messages?sessionId=<uuid>
```

If you see `401 Unauthorized`, the API key is missing or incorrect.

---

## Session Lifecycle

Sessions are held **in memory** — they are lost when the server restarts. Each new SSE connection creates a fresh session. This is intentional for development; long-lived production sessions will require persistent session storage (not yet implemented).
