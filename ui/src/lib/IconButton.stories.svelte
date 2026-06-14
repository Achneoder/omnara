<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import IconButton from './IconButton.svelte';

  const { Story } = defineMeta({
    title: 'Core/IconButton',
    component: IconButton,
    argTypes: {
      variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
    },
  });
</script>

<Story name="Ghost">
  <IconButton label="Revert" variant="ghost">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      width="18"
      height="18"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  </IconButton>
</Story>

<Story name="Outline">
  <IconButton label="Settings" variant="outline">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="3" /><path
        d="M19.07 4.93A10 10 0 0 0 3 12h0a10 10 0 0 0 9.93 10 10 10 0 0 0 7.14-3.07"
      />
    </svg>
  </IconButton>
</Story>

<Story name="Solid">
  <IconButton label="Add" variant="solid">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      width="18"
      height="18"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  </IconButton>
</Story>

<Story name="Sizes">
  <div style="display:flex;gap:10px;align-items:center">
    <IconButton label="Add" variant="outline" size="sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        width="14"
        height="14"><path d="M12 5v14M5 12h14" /></svg
      >
    </IconButton>
    <IconButton label="Add" variant="outline" size="md">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        width="18"
        height="18"><path d="M12 5v14M5 12h14" /></svg
      >
    </IconButton>
    <IconButton label="Add" variant="outline" size="lg">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        width="20"
        height="20"><path d="M12 5v14M5 12h14" /></svg
      >
    </IconButton>
  </div>
</Story>

<Story name="All Variants">
  <div style="display:flex;gap:10px;align-items:center">
    <IconButton label="Revert" variant="ghost">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        width="18"
        height="18"
        ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg
      >
    </IconButton>
    <IconButton label="Settings" variant="outline">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        width="18"
        height="18"><circle cx="12" cy="12" r="3" /></svg
      >
    </IconButton>
    <IconButton label="Add" variant="solid">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        width="18"
        height="18"><path d="M12 5v14M5 12h14" /></svg
      >
    </IconButton>
  </div>
</Story>
