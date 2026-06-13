# UI kit · Management Dashboard

The **human-facing** omnara surface (light theme). A Svelte-built console in production; recreated here in React composing the design-system primitives. Where editors review AI-generated content, manage the content library, connect sites, and own the confidential settings they don't want an agent touching.

## Screens (`index.html` is interactive — switch via the left nav)
- **Overview** — stat cards, a "Needs your review" list of AI drafts, and an activity feed.
- **Content** — filterable library table (tabs: All / AI-drafted / Needs review / Live) with status badges, platform tags, and authorship.
- **Review queue** — split list + detail with the AI draft, change diff, and Approve & publish.
- **Settings** — agent-autonomy switches and a confidential secrets vault (human-only).

## Files
- `index.html` — layout CSS + interactive app (screen routing, toasts).
- `shell.jsx` — `Sidebar`, `Topbar`.
- `screens.jsx` — `Overview`, `ContentLibrary`, `ReviewQueue`.

## Components used
Button, IconButton, Badge, Tag, Avatar (incl. `agent`), Card/CardHeader, Input, Select, Switch, Tabs, Toast, Tooltip.

## Notes
- Light theme (default tokens). AI authorship is always disclosed with the amber **spark** badge; **Live** uses the pulsing green dot.
- This is a cosmetic recreation — data is mocked, no real MCP calls.
