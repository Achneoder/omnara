<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    siteId: string;
    siteName: string;
  }

  let { siteId, siteName }: Props = $props();

  interface NavItem {
    label: string;
    href: string;
    icon: string;
    matchPrefix?: boolean;
  }

  const siteNav: NavItem[] = [
    {
      label: 'Content',
      href: `/sites/${siteId}/content`,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Assets',
      href: `/sites/${siteId}/assets`,
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      label: 'Review Queue',
      href: `/sites/${siteId}/review`,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
      label: 'Theme',
      href: `/sites/${siteId}/theme`,
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      matchPrefix: true,
    },
    {
      label: 'Webhooks',
      href: `/sites/${siteId}/webhooks`,
      icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    },
    {
      label: 'API Keys',
      href: `/sites/${siteId}/api-keys`,
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
    {
      label: 'Settings',
      href: `/sites/${siteId}/settings`,
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ];

  function isActive(item: NavItem): boolean {
    if (item.matchPrefix) {
      return $page.url.pathname.startsWith(item.href);
    }
    return $page.url.pathname === item.href;
  }
</script>

<div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
  <a
    href="/sites"
    class="mb-1 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
    aria-label="Back to all sites"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    All sites
  </a>
  <p class="text-sm font-semibold text-gray-900 truncate" title={siteName}>{siteName}</p>
</div>

<nav class="p-3" aria-label="Site navigation">
  <ul class="space-y-0.5" role="list">
    {#each siteNav as item (item.href)}
      <li>
        <a
          href={item.href}
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
					{isActive(item)
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
          aria-current={isActive(item) ? 'page' : undefined}
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
