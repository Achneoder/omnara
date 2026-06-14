<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Dialog from './Dialog.svelte';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Feedback/Dialog',
    component: Dialog,
    argTypes: {
      size: { control: 'select', options: ['md', 'lg'] },
    },
    parameters: {
      layout: 'centered',
    },
  });
</script>

<Story name="Publish Confirmation">
  <div style="position:relative;width:500px;height:300px;overflow:hidden">
    <div
      style="position:absolute;inset:0;background:rgba(26,24,20,.5);display:flex;align-items:center;justify-content:center;padding:24px"
    >
      <Dialog
        title="Publish to production?"
        description="omnara will push 3 pages to shop.example.com."
        onClose={() => {}}
      >
        {#snippet icon()}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            width="18"
            height="18"><path d="m5 12 5 5L20 7" /></svg
          >
        {/snippet}
        {#snippet footer()}
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Publish changes</Button>
        {/snippet}
        <span style="font:var(--type-body-sm);color:var(--text-muted)">
          This can be reverted from version history.
        </span>
      </Dialog>
    </div>
  </div>
</Story>

<Story name="Delete Warning">
  <div style="position:relative;width:500px;height:280px;overflow:hidden">
    <div
      style="position:absolute;inset:0;background:rgba(26,24,20,.5);display:flex;align-items:center;justify-content:center;padding:24px"
    >
      <Dialog
        title="Delete content item?"
        description="This action cannot be undone."
        onClose={() => {}}
      >
        {#snippet footer()}
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete permanently</Button>
        {/snippet}
      </Dialog>
    </div>
  </div>
</Story>

<Story name="Large">
  <div style="position:relative;width:700px;height:400px;overflow:hidden">
    <div
      style="position:absolute;inset:0;background:rgba(26,24,20,.5);display:flex;align-items:center;justify-content:center;padding:24px"
    >
      <Dialog
        size="lg"
        title="Review AI draft"
        description="omnara generated this page — review before publishing."
        onClose={() => {}}
      >
        {#snippet footer()}
          <Button variant="ghost">Request changes</Button>
          <Button variant="secondary">Save as draft</Button>
          <Button variant="primary">Approve & publish</Button>
        {/snippet}
        <p style="font:var(--type-body-sm);color:var(--text-muted);margin:0">
          The agent drafted a product description for the Summer Collection launch page.
        </p>
      </Dialog>
    </div>
  </div>
</Story>
