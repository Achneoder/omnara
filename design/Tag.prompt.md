The default content frame — flat surface with a hairline border; elevation is restrained. Use `interactive` for clickable cards, `selected` for the signal-green selection ring.

```jsx
<Card elevation="flat" padding="md">
  <CardHeader title="Homepage" icon={<i data-lucide="file-text" />}
    action={<Badge variant="live" dot>Live</Badge>} />
  <p className="om-card__body">Last edited by omnara · 2s ago</p>
</Card>
```

`Card` props: `elevation (flat|raised)`, `padding (sm|md|lg)`, `interactive`, `selected`. Pair with `CardHeader` (`title`, `icon`, `action`).
