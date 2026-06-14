<script lang="ts">
  import Badge from './Badge.svelte';

  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    label?: string;
  }

  let { variant = 'default', label = 'Badge' }: Props = $props();
</script>

<Badge {variant}>{label}</Badge>
