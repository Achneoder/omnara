<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tabs from './Tabs.svelte';

  const { Story } = defineMeta({
    title: 'Navigation/Tabs',
    component: Tabs,
    argTypes: {
      variant: { control: 'select', options: ['underline', 'pill'] },
    },
  });
</script>

<Story name="Underline">
  <Tabs
    variant="underline"
    items={[
      { value: 'overview', label: 'Overview' },
      { value: 'library', label: 'Content library' },
      { value: 'review', label: 'Review queue' },
      { value: 'settings', label: 'Settings' },
    ]}
  />
</Story>

<Story name="Pill">
  <Tabs
    variant="pill"
    items={[
      { value: 'all', label: 'All' },
      { value: 'live', label: 'Live' },
      { value: 'draft', label: 'Drafts' },
      { value: 'review', label: 'In review' },
    ]}
  />
</Story>

<Story name="Underline With Active">
  <Tabs
    variant="underline"
    value="library"
    items={[
      { value: 'overview', label: 'Overview' },
      { value: 'library', label: 'Content library' },
      { value: 'review', label: 'Review queue' },
    ]}
  />
</Story>

<Story name="Pill With Active">
  <Tabs
    variant="pill"
    value="draft"
    items={[
      { value: 'all', label: 'All' },
      { value: 'live', label: 'Live' },
      { value: 'draft', label: 'Drafts' },
      { value: 'review', label: 'In review' },
    ]}
  />
</Story>

<Story name="Short List">
  <Tabs
    variant="pill"
    items={[
      { value: 'content', label: 'Content' },
      { value: 'media', label: 'Media' },
    ]}
  />
</Story>
