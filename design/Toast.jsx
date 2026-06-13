A monospace token for metadata — content types, taxonomies, connected platforms, API keys. Set in JetBrains Mono to read as "machine data."

```jsx
<Tag icon={<i data-lucide="globe" />}>shopify</Tag>
<Tag variant="accent">blog/post</Tag>
<Tag onRemove={() => removeTag("draft")}>draft</Tag>
```

Variants: `default` (inset), `accent` (signal soft). Pass `onRemove` for a removable chip.
