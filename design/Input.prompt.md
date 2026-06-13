Hover/focus tooltip on a dark chip. Wrap any trigger; pass `kbd` to append a mono shortcut hint.

```jsx
<Tooltip label="Revert to previous version" kbd="⌘Z" side="top">
  <IconButton label="Revert"><i data-lucide="rotate-ccw" /></IconButton>
</Tooltip>
```

Props: `label`, `kbd`, `side (top|bottom)`. Keep labels short.
