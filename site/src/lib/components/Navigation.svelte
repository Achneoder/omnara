<script lang="ts">
  import { page } from '$app/stores';

  let mobileMenuOpen = $state(false);

  const links = [
    { href: '/', label: 'Startseite' },
    { href: '/sortiment', label: 'Sortiment' },
    { href: '/service', label: 'Service' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  function isActive(href: string): boolean {
    if (href === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(href);
  }

  function toggleMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMenu() {
    mobileMenuOpen = false;
  }
</script>

<header
  class="sticky top-0 z-50 bg-[var(--color-brand-cream)] shadow-sm border-b border-[var(--color-brand-cream-dark)]"
>
  <nav class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Hauptnavigation">
    <div class="flex items-center justify-between h-16">
      <a
        href="/"
        class="flex items-center gap-2 text-xl font-bold text-[var(--color-brand-pink-dark)] hover:text-[var(--color-brand-pink)] transition-colors"
        onclick={closeMenu}
      >
        <span class="text-2xl" aria-hidden="true">🍦</span>
        <span>Softeis Kai</span>
      </a>

      <ul class="hidden md:flex items-center gap-1" role="list">
        {#each links as link}
          <li>
            <a
              href={link.href}
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors {isActive(
                link.href,
              )
                ? 'bg-[var(--color-brand-pink)] text-white'
                : 'text-[var(--color-brand-text)] hover:bg-[var(--color-brand-pink-light)] hover:text-[var(--color-brand-pink-dark)]'}"
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>

      <button
        class="md:hidden p-2 rounded-lg text-[var(--color-brand-text)] hover:bg-[var(--color-brand-pink-light)] transition-colors"
        onclick={toggleMenu}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
      >
        {#if mobileMenuOpen}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        {/if}
      </button>
    </div>

    {#if mobileMenuOpen}
      <div id="mobile-menu" class="md:hidden pb-4">
        <ul class="flex flex-col gap-1" role="list">
          {#each links as link}
            <li>
              <a
                href={link.href}
                class="block px-4 py-3 rounded-xl text-sm font-medium transition-colors {isActive(
                  link.href,
                )
                  ? 'bg-[var(--color-brand-pink)] text-white'
                  : 'text-[var(--color-brand-text)] hover:bg-[var(--color-brand-pink-light)] hover:text-[var(--color-brand-pink-dark)]'}"
                aria-current={isActive(link.href) ? 'page' : undefined}
                onclick={closeMenu}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </nav>
</header>
