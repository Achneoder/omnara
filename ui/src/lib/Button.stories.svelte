<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Core/Button',
    component: Button,
    argTypes: {
      variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
      loading: { control: 'boolean' },
      disabled: { control: 'boolean' },
      fullWidth: { control: 'boolean' },
    },
  });
</script>

<Story name="Primary">
  <Button variant="primary">Publish changes</Button>
</Story>

<Story name="Secondary">
  <Button variant="secondary">Send to review</Button>
</Story>

<Story name="Ghost">
  <Button variant="ghost">View diff</Button>
</Story>

<Story name="Danger">
  <Button variant="danger">Delete content</Button>
</Story>

<Story name="Loading">
  <Button variant="primary" loading>Publishing…</Button>
</Story>

<Story name="Disabled">
  <Button variant="primary" disabled>Publish changes</Button>
</Story>

<Story name="Sizes">
  <div style="display:flex;gap:12px;align-items:center">
    <Button variant="primary" size="sm">Small</Button>
    <Button variant="primary" size="md">Medium</Button>
    <Button variant="primary" size="lg">Large</Button>
  </div>
</Story>

<Story name="Full Width">
  <div style="max-width:320px">
    <Button variant="primary" fullWidth>Connect site</Button>
  </div>
</Story>

<Story name="All Variants">
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <Button variant="primary">Publish</Button>
    <Button variant="secondary">Review</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="danger">Delete</Button>
  </div>
</Story>
