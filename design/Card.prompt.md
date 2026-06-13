Pill-shaped status indicator for content state and AI authorship. Use `live` (pulsing green dot) for published/active, `ai` (amber) to disclose AI-generated content.

```jsx
<Badge variant="live" dot>Live</Badge>
<Badge variant="ai"><i data-lucide="sparkles" />Drafted by omnara</Badge>
<Badge variant="warning">Needs review</Badge>
<Badge variant="neutral">v0.42</Badge>
```

Variants: `neutral | live | ai | warning | danger | info | solid`. `dot` adds a leading status dot.
