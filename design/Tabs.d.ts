Styled native select with the omnara chevron. Pass `options` (strings or `{value,label}`) or `<option>` children.

```jsx
<Select label="Target platform" options={["WordPress", "Shopify", "Wix", "Custom API"]} />
<Select label="Status" size="sm" options={[{value:"live",label:"Live"},{value:"review",label:"Needs review"}]} />
```

Props: `label`, `hint`, `size (sm|md)`, `options`.
