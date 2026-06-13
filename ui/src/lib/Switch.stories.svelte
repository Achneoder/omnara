<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Switch from './Switch.svelte';

  const { Story } = defineMeta({
    title: 'Forms/Switch',
    component: Switch,
    argTypes: {
      disabled: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <Switch label="Let omnara auto-publish" />
</Story>

<Story name="Checked">
  <Switch label="Let omnara auto-publish" checked />
</Story>

<Story name="With Description">
  <Switch label="Auto-publish" description="omnara will publish approved content automatically" />
</Story>

<Story name="Disabled">
  <Switch label="Auto-publish" disabled />
</Story>

<Story name="Disabled Checked">
  <Switch label="Read-only setting" disabled checked />
</Story>

<Story name="Settings Group">
  <div style="display:flex;flex-direction:column;gap:20px;max-width:420px">
    <Switch label="Auto-publish drafts" description="Publish after agent review" checked />
    <Switch label="Notify on publish" description="Send email when pages go live" checked />
    <Switch label="Sync media files" description="Mirror images to CDN" />
    <Switch label="Allow agent edits" description="Agent can modify existing pages" disabled />
  </div>
</Story>
