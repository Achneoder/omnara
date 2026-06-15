<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte';

  interface NavItem {
    label: string;
    href: string;
    icon: string;
  }

  const topNav: NavItem[] = [
    {
      label: 'Sites',
      href: '/sites',
      icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    },
    {
      label: 'Activity',
      href: '/activity',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'API Keys',
      href: '/api-keys',
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
  ];

  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }

  async function handleLogout() {
    await auth.logout();
    goto('/login');
  }
</script>

<aside class="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
  <div class="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
    <div class="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
      <span class="text-xs font-bold text-white">O</span>
    </div>
    <span class="text-sm font-semibold text-gray-900">omnara</span>
  </div>

  <nav class="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
    <ul class="space-y-0.5" role="list">
      {#each topNav as item}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
						{isActive(item.href)
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="border-t border-gray-200 p-3">
    <div class="mb-2 px-3 py-1">
      <p class="text-xs font-medium text-gray-900 truncate">{auth.user?.email ?? ''}</p>
      <p class="text-xs text-gray-500 capitalize">{auth.user?.role ?? ''}</p>
    </div>
    <button
      onclick={handleLogout}
      class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign out
    </button>
  </div>
</aside>
