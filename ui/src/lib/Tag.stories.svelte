<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tag from './Tag.svelte';

  const { Story } = defineMeta({
    title: 'Core/Tag',
    component: Tag,
    argTypes: {
      variant: { control: 'select', options: ['default', 'accent'] },
    },
  });
</script>

<Story name="Default">
  <Tag>shopify</Tag>
</Story>

<Story name="Accent">
  <Tag variant="accent">blog/post</Tag>
</Story>

<Story name="Removable">
  <Tag onRemove={() => {}}>draft</Tag>
</Story>

<Story name="With Icon">
  <Tag>
    {#snippet icon()}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        width="13"
        height="13"
      >
        <circle cx="12" cy="12" r="10" /><path
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        />
      </svg>
    {/snippet}
    wordpress
  </Tag>
</Story>

<Story name="All Variants">
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <Tag>shopify</Tag>
    <Tag variant="accent">blog/post</Tag>
    <Tag onRemove={() => {}}>draft</Tag>
    <Tag variant="accent" onRemove={() => {}}>published</Tag>
  </div>
</Story>
