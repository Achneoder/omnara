Single-line text field with built-in label, hint, error and icon/affix slots. Placeholders and labels are sentence case.

```jsx
<Input label="Site URL" prefix="https://" placeholder="shop.example.com"
  iconRight={<i data-lucide="globe" />} />
<Input label="API key" error="Couldn't validate this key" required />
```

Props: `label`, `hint`, `error` (red state), `required`, `size (sm|md|lg)`, `iconLeft`, `iconRight`, `prefix`. Forwards all native input attributes.
