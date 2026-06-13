The primary action control — use for any clickable command; reach for `primary` once per view (the main action), `secondary`/`ghost` for everything else.

```jsx
<Button variant="primary" iconLeft={<i data-lucide="sparkles" />}>
  Draft with omnara
</Button>
<Button variant="secondary">Review</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger" loading>Reverting…</Button>
```

Variants: `primary` (signal green), `secondary` (neutral outline), `ghost` (text-only), `danger` (destructive). Sizes `sm | md | lg`. `loading` swaps the label for a spinner; `fullWidth` stretches; `as="a"` renders a link. Labels are sentence case, no trailing period.
