<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Badge from './Badge.svelte';

  const { Story } = defineMeta({
    title: 'Core/Badge',
    component: Badge,
    argTypes: {
      variant: {
        control: 'select',
        options: ['neutral', 'live', 'ai', 'warning', 'danger', 'info', 'solid'],
      },
      dot: { control: 'boolean' },
    },
  });
</script>

<Story name="Neutral">
  <Badge variant="neutral">Draft</Badge>
</Story>

<Story name="Live">
  <Badge variant="live" dot>Live</Badge>
</Story>

<Story name="AI">
  <Badge variant="ai">AI generated</Badge>
</Story>

<Story name="Warning">
  <Badge variant="warning">Needs review</Badge>
</Story>

<Story name="Danger">
  <Badge variant="danger">Failed</Badge>
</Story>

<Story name="Info">
  <Badge variant="info">Scheduled</Badge>
</Story>

<Story name="Solid">
  <Badge variant="solid">Published</Badge>
</Story>

<Story name="All Variants">
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <Badge variant="neutral">Draft</Badge>
    <Badge variant="live" dot>Live</Badge>
    <Badge variant="ai">AI generated</Badge>
    <Badge variant="warning">Needs review</Badge>
    <Badge variant="danger">Failed</Badge>
    <Badge variant="info">Scheduled</Badge>
    <Badge variant="solid">Published</Badge>
  </div>
</Story>
