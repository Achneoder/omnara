Transient notification card. Use `success` for completed publishes, `ai` to surface agent activity, `danger` for failures.

```jsx
<Toast variant="success" title="Published" onClose={dismiss}>
  3 pages live on shop.example.com
</Toast>
<Toast variant="ai" title="omnara drafted a page" icon={<i data-lucide="sparkles" />}>
  Review before it goes live
</Toast>
```

Variants: `success | info | danger | ai`. Presentational — manage stacking/timeout in your app.
