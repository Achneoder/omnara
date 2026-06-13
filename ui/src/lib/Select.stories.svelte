<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Select from './Select.svelte';

  const { Story } = defineMeta({
    title: 'Forms/Select',
    component: Select,
    argTypes: {
      size: { control: 'select', options: ['sm', 'md'] },
      disabled: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <div style="max-width:360px">
    <Select label="Target platform" options={['WordPress', 'Shopify', 'Wix', 'Custom API']} />
  </div>
</Story>

<Story name="With Value-Label Options">
  <div style="max-width:360px">
    <Select
      label="Content status"
      options={[
        { value: 'live', label: 'Live' },
        { value: 'review', label: 'Needs review' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ]}
    />
  </div>
</Story>

<Story name="With Hint">
  <div style="max-width:360px">
    <Select
      label="Review frequency"
      hint="omnara will notify you at this cadence"
      options={['Immediately', 'Daily digest', 'Weekly digest', 'Never']}
    />
  </div>
</Story>

<Story name="Error State">
  <div style="max-width:360px">
    <Select
      label="Target platform"
      error="Select a connected platform first"
      options={['WordPress', 'Shopify', 'Wix']}
    />
  </div>
</Story>

<Story name="Disabled">
  <div style="max-width:360px">
    <Select label="Target platform" disabled options={['WordPress', 'Shopify']} />
  </div>
</Story>

<Story name="Sizes">
  <div style="display:flex;flex-direction:column;gap:16px;max-width:360px">
    <Select label="Small" size="sm" options={['WordPress', 'Shopify', 'Wix']} />
    <Select label="Medium" size="md" options={['WordPress', 'Shopify', 'Wix']} />
  </div>
</Story>
