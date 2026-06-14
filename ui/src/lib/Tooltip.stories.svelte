<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tooltip from './Tooltip.svelte';
  import IconButton from './IconButton.svelte';

  const { Story } = defineMeta({
    title: 'Feedback/Tooltip',
    component: Tooltip,
    argTypes: {
      side: { control: 'select', options: ['top', 'bottom'] },
    },
  });
</script>

<Story name="Default (Top)">
  <div style="padding:60px;display:inline-flex">
    <Tooltip label="Revert to previous version">
      <IconButton label="Revert" variant="outline">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="18"
          height="18"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
        </svg>
      </IconButton>
    </Tooltip>
  </div>
</Story>

<Story name="With Keyboard Hint">
  <div style="padding:60px;display:inline-flex">
    <Tooltip label="Revert to previous version" kbd="⌘Z">
      <IconButton label="Revert" variant="outline">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="18"
          height="18"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
        </svg>
      </IconButton>
    </Tooltip>
  </div>
</Story>

<Story name="Bottom">
  <div style="padding:30px 60px 80px;display:inline-flex">
    <Tooltip label="Version history" side="bottom">
      <IconButton label="History" variant="outline">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="18"
          height="18"
        >
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </IconButton>
    </Tooltip>
  </div>
</Story>

<Story name="Multiple">
  <div style="padding:60px 40px;display:flex;gap:12px">
    <Tooltip label="Revert to previous" kbd="⌘Z">
      <IconButton label="Revert" variant="outline">
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
    </Tooltip>
    <Tooltip label="Version history" kbd="⌘H">
      <IconButton label="History" variant="outline">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="18"
          height="18"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg
        >
      </IconButton>
    </Tooltip>
    <Tooltip label="Publish changes" kbd="⌘P">
      <IconButton label="Publish" variant="solid">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          width="18"
          height="18"><path d="m5 12 5 5L20 7" /></svg
        >
      </IconButton>
    </Tooltip>
  </div>
</Story>
