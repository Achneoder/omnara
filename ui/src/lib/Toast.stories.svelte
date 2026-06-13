<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Toast from './Toast.svelte';

  const { Story } = defineMeta({
    title: 'Feedback/Toast',
    component: Toast,
    argTypes: {
      variant: { control: 'select', options: ['success', 'info', 'danger', 'ai'] },
    },
  });
</script>

<Story name="Success">
  <Toast variant="success" title="Published" onClose={() => {}}>
    3 pages live on shop.example.com
  </Toast>
</Story>

<Story name="Info">
  <Toast variant="info" title="Sync in progress" onClose={() => {}}>
    Syncing content to 2 connected sites
  </Toast>
</Story>

<Story name="Danger">
  <Toast variant="danger" title="Publish failed" onClose={() => {}}>
    Could not reach shop.example.com — check connection
  </Toast>
</Story>

<Story name="AI">
  <Toast variant="ai" title="omnara drafted a page" onClose={() => {}}>
    Review before it goes live
  </Toast>
</Story>

<Story name="All Variants">
  <div style="display:flex;flex-direction:column;gap:12px">
    <Toast variant="success" title="Published" onClose={() => {}}
      >3 pages live on shop.example.com</Toast
    >
    <Toast variant="info" title="Sync in progress" onClose={() => {}}>Syncing to 2 sites</Toast>
    <Toast variant="danger" title="Publish failed" onClose={() => {}}
      >Could not reach shop.example.com</Toast
    >
    <Toast variant="ai" title="omnara drafted a page" onClose={() => {}}
      >Review before it goes live</Toast
    >
  </div>
</Story>

<Story name="No Close Button">
  <Toast variant="success" title="Auto-published">Home page updated automatically</Toast>
</Story>
