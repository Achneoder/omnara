<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Card from './Card.svelte';
  import CardHeader from './CardHeader.svelte';

  const { Story } = defineMeta({
    title: 'Core/Card',
    component: Card,
    argTypes: {
      elevation: { control: 'select', options: ['flat', 'raised'] },
      padding: { control: 'select', options: ['sm', 'md', 'lg'] },
      interactive: { control: 'boolean' },
      selected: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <Card>
    <CardHeader title="Content overview" />
    <p style="font:var(--type-body-sm);color:var(--text-muted);margin:0">
      omnara has published 42 pages across 3 connected sites.
    </p>
  </Card>
</Story>

<Story name="Raised">
  <Card elevation="raised">
    <CardHeader title="Recent activity" />
    <p style="font:var(--type-body-sm);color:var(--text-muted);margin:0">
      3 pages published in the last 24 hours.
    </p>
  </Card>
</Story>

<Story name="Interactive">
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:600px">
    <Card interactive>
      <CardHeader title="WordPress" />
      <p style="font:var(--type-body-sm);color:var(--text-muted);margin:0">journal.example.com</p>
    </Card>
    <Card interactive selected>
      <CardHeader title="Shopify" />
      <p style="font:var(--type-body-sm);color:var(--text-muted);margin:0">shop.example.com</p>
    </Card>
  </div>
</Story>

<Story name="Padding Sizes">
  <div style="display:flex;flex-direction:column;gap:16px;max-width:400px">
    <Card padding="sm"><p style="margin:0">Small padding</p></Card>
    <Card padding="md"><p style="margin:0">Medium padding</p></Card>
    <Card padding="lg"><p style="margin:0">Large padding</p></Card>
  </div>
</Story>
