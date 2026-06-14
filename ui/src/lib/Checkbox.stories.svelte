<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Checkbox from './Checkbox.svelte';

  const { Story } = defineMeta({
    title: 'Forms/Checkbox',
    component: Checkbox,
    argTypes: {
      disabled: { control: 'boolean' },
      indeterminate: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <Checkbox label="Include drafts" />
</Story>

<Story name="Checked">
  <Checkbox label="Sync media" checked />
</Story>

<Story name="With Description">
  <Checkbox label="Sync media" description="Mirror images to the CDN on publish" />
</Story>

<Story name="Indeterminate">
  <Checkbox label="Select all" indeterminate />
</Story>

<Story name="Disabled">
  <Checkbox label="Auto-publish (requires approval)" disabled />
</Story>

<Story name="Disabled Checked">
  <Checkbox label="Read-only setting" disabled checked />
</Story>

<Story name="Group">
  <div style="display:flex;flex-direction:column;gap:12px">
    <Checkbox label="WordPress" description="journal.example.com" checked />
    <Checkbox label="Shopify" description="shop.example.com" checked />
    <Checkbox label="Custom API" description="studio.example.io" />
    <Checkbox label="Wix" disabled description="Not connected" />
  </div>
</Story>
