<script lang="ts">
  interface Props {
    name?: string;
    src?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    agent?: boolean;
    status?: boolean;
    class?: string;
  }

  let {
    name = '',
    src,
    size = 'md',
    agent = false,
    status = false,
    class: className = '',
  }: Props = $props();

  function initials(n: string) {
    return n
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] || '')
      .join('')
      .toUpperCase();
  }

  const agentSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='10.4' stroke='%23FAF8F3' stroke-width='3.2'/><circle cx='16' cy='16' r='2.6' fill='%23FAF8F3'/><circle cx='23.5' cy='8.5' r='3.6' fill='%232FC97A'/></svg>`;
</script>

<span
  class="om-avatar om-avatar--{size} {agent ? 'om-avatar--agent' : ''} {className}"
  title={agent ? 'omnara' : name}
  aria-label={agent ? 'omnara agent' : name}
>
  {#if agent}
    <img src={agentSvg} alt="omnara" />
  {:else if src}
    <img {src} alt={name} />
  {:else}
    <span>{initials(name)}</span>
  {/if}
  {#if status}
    <span class="om-avatar__status" aria-hidden="true"></span>
  {/if}
</span>

<style>
  :global(.om-avatar) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: var(--radius-full);
    overflow: hidden;
    font-family: var(--font-display);
    font-weight: var(--weight-medium);
    color: var(--text-strong);
    background: var(--bg-sunken);
    border: 1px solid var(--border-subtle);
    position: relative;
    user-select: none;
  }
  :global(.om-avatar img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  :global(.om-avatar--xs) {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
  :global(.om-avatar--sm) {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  :global(.om-avatar--md) {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
  :global(.om-avatar--lg) {
    width: 48px;
    height: 48px;
    font-size: 17px;
  }
  :global(.om-avatar--agent) {
    background: var(--stone-900);
    border-color: var(--signal-600);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--signal-500) 35%, transparent);
  }
  :global(.om-avatar__status) {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 30%;
    height: 30%;
    min-width: 8px;
    min-height: 8px;
    border-radius: 50%;
    border: 2px solid var(--surface);
    background: var(--success);
  }
</style>
