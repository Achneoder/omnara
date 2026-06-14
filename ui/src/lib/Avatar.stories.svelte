<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Avatar from './Avatar.svelte';

  const { Story } = defineMeta({
    title: 'Core/Avatar',
    component: Avatar,
    argTypes: {
      size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
      agent: { control: 'boolean' },
      status: { control: 'boolean' },
    },
  });
</script>

<Story name="Initials">
  <Avatar name="Dana Reyes" />
</Story>

<Story name="With Image">
  <Avatar name="Sam Chen" src="https://i.pravatar.cc/150?img=12" />
</Story>

<Story name="Agent">
  <Avatar agent />
</Story>

<Story name="With Status">
  <Avatar name="Dana Reyes" status />
</Story>

<Story name="Agent With Status">
  <Avatar agent status />
</Story>

<Story name="Sizes">
  <div style="display:flex;gap:16px;align-items:center">
    <Avatar name="Dana Reyes" size="xs" />
    <Avatar name="Dana Reyes" size="sm" />
    <Avatar name="Dana Reyes" size="md" />
    <Avatar name="Dana Reyes" size="lg" />
  </div>
</Story>

<Story name="Agent Sizes">
  <div style="display:flex;gap:16px;align-items:center">
    <Avatar agent size="xs" />
    <Avatar agent size="sm" />
    <Avatar agent size="md" />
    <Avatar agent size="lg" />
  </div>
</Story>
