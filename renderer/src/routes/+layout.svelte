<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  interface Props {
    data: LayoutData;
    children: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();

  const navItems = [
    { label: 'Startseite', href: '/' },
    { label: 'Sortiment', href: '/sortiment' },
    { label: 'Service', href: '/service' },
    { label: 'Kontakt', href: '/kontakt' },
  ];

  const currentPath = $derived($page.url.pathname);

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  }
</script>

<div class="min-h-screen flex flex-col font-sans">
  <!-- Navigation -->
  <header
    class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-brand-pink-light shadow-sm"
  >
    <nav
      class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      aria-label="Hauptnavigation"
    >
      <a
        href="/"
        class="flex items-center gap-2 font-extrabold text-xl text-brand-chocolate hover:text-brand-pink-dark transition-colors"
      >
        <span aria-hidden="true">🍦</span>
        <span>Softeis Kai</span>
      </a>

      <ul class="flex items-center gap-1 sm:gap-2" role="list">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                {isActive(item.href)
                ? 'text-brand-pink-dark border-b-2 border-brand-pink'
                : 'text-gray-600 hover:text-brand-chocolate hover:bg-brand-pink-light'}"
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </header>

  <!-- Main content -->
  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-brand-chocolate text-white py-12 px-6 mt-auto">
    <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span aria-hidden="true">🍦</span>
          <span class="font-bold text-lg">Softeis Kai</span>
        </div>
        {#if data.businessInfo?.body}
          <address class="not-italic text-sm text-white/80 space-y-1">
            <p>{data.businessInfo.body.owner}</p>
            <p>{data.businessInfo.body.street}</p>
            <p>{data.businessInfo.body.zip} {data.businessInfo.body.city}</p>
          </address>
        {/if}
      </div>

      <div class="text-sm text-white/80 space-y-2">
        {#if data.businessInfo?.body?.phone}
          <p>
            <a href="tel:{data.businessInfo.body.phone}" class="hover:text-white transition-colors">
              {data.businessInfo.body.phone}
            </a>
          </p>
        {/if}
        {#if data.businessInfo?.body?.email}
          <p>
            <a
              href="mailto:{data.businessInfo.body.email}"
              class="hover:text-white transition-colors"
            >
              {data.businessInfo.body.email}
            </a>
          </p>
        {/if}
      </div>
    </div>

    <div
      class="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/50"
    >
      &copy; 2025 Eisspezialitäten Kai Fischer
    </div>
  </footer>
</div>
