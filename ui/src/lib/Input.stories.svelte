<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';

  const { Story } = defineMeta({
    title: 'Forms/Input',
    component: Input,
    argTypes: {
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
      disabled: { control: 'boolean' },
      required: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <div style="max-width:360px">
    <Input label="Site name" placeholder="My awesome site" />
  </div>
</Story>

<Story name="With Prefix">
  <div style="max-width:360px">
    <Input label="Site URL" prefix="https://" placeholder="shop.example.com" />
  </div>
</Story>

<Story name="With Hint">
  <div style="max-width:360px">
    <Input label="API key" hint="Found in your site's developer settings" placeholder="sk_live_…" />
  </div>
</Story>

<Story name="Error State">
  <div style="max-width:360px">
    <Input
      label="API key"
      error="Couldn't validate this key — check it's active"
      value="sk_invalid_key"
    />
  </div>
</Story>

<Story name="Required">
  <div style="max-width:360px">
    <Input label="Site URL" required placeholder="https://shop.example.com" />
  </div>
</Story>

<Story name="Disabled">
  <div style="max-width:360px">
    <Input label="Connected site" disabled value="shop.example.com" />
  </div>
</Story>

<Story name="Sizes">
  <div style="display:flex;flex-direction:column;gap:16px;max-width:360px">
    <Input label="Small" size="sm" placeholder="Small input" />
    <Input label="Medium" size="md" placeholder="Medium input" />
    <Input label="Large" size="lg" placeholder="Large input" />
  </div>
</Story>

<Story name="With Icon">
  <div style="max-width:360px">
    <Input label="Search content" placeholder="Search pages, posts…">
      {#snippet iconLeft()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="16"
          height="16"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      {/snippet}
    </Input>
  </div>
</Story>
