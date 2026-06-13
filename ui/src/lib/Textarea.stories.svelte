<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Textarea from './Textarea.svelte';

  const { Story } = defineMeta({
    title: 'Forms/Textarea',
    component: Textarea,
    argTypes: {
      resize: { control: 'select', options: ['none', 'vertical', 'auto'] },
      disabled: { control: 'boolean' },
      required: { control: 'boolean' },
    },
  });
</script>

<Story name="Default">
  <div style="max-width:420px">
    <Textarea label="Content instructions" placeholder="Tell omnara how to write for this site…" />
  </div>
</Story>

<Story name="With Hint">
  <div style="max-width:420px">
    <Textarea
      label="Brand voice"
      hint="Describe your brand's tone and style. The agent will use this for all content."
      placeholder="We write in a friendly, professional tone…"
    />
  </div>
</Story>

<Story name="Error State">
  <div style="max-width:420px">
    <Textarea
      label="Content instructions"
      error="Instructions are required to connect a site"
      value=""
    />
  </div>
</Story>

<Story name="Required">
  <div style="max-width:420px">
    <Textarea label="Review notes" required placeholder="Add your feedback…" />
  </div>
</Story>

<Story name="Disabled">
  <div style="max-width:420px">
    <Textarea
      label="AI-generated summary"
      disabled
      value="omnara analyzed 42 pages and identified the primary content themes as: product launches, seasonal promotions, and brand storytelling."
    />
  </div>
</Story>

<Story name="No Resize">
  <div style="max-width:420px">
    <Textarea label="Fixed height" resize="none" rows={3} placeholder="Fixed height textarea…" />
  </div>
</Story>
