<script lang="ts">
  import Button from './Button.svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    label?: string;
    onclick?: () => void;
  }

  let {
    variant = 'primary',
    disabled = false,
    loading = false,
    type = 'button',
    label = 'Click me',
    onclick,
  }: Props = $props();
</script>

<Button {variant} {disabled} {loading} {type} {onclick}>
  {label}
</Button>
