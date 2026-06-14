import { browser } from '$app/environment';

export interface ThemeComponent {
  id: string;
  slug: string;
  name: string;
  category: string;
  template: string;
  css: string | null;
  propsSchema: Record<string, string>;
}

export interface SiteTheme {
  id: string;
  name: string;
  version: string;
  tokens: Record<string, string>;
  rawCss: string | null;
  components: ThemeComponent[];
  updatedAt: string;
}

export let theme = $state<SiteTheme | null>(null);

let styleEl: HTMLStyleElement | null = null;
let etag: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

export async function initTheme(siteId: string, apiUrl: string): Promise<void> {
  const result = await fetchTheme(siteId, apiUrl);
  etag = result.etag;

  if (result.theme) {
    theme = result.theme;
    injectThemeStyles(result.theme);
  }

  if (pollTimer !== null) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(async () => {
    const polled = await fetchTheme(siteId, apiUrl, etag ?? undefined);
    if (polled.theme) {
      theme = polled.theme;
      etag = polled.etag;
      injectThemeStyles(polled.theme);
    }
  }, 30000);
}

function injectThemeStyles(t: SiteTheme): void {
  if (!browser) return;

  const parts: string[] = [];

  const tokenEntries = Object.entries(t.tokens);
  if (tokenEntries.length > 0) {
    const vars = tokenEntries.map(([prop, val]) => `  ${prop}: ${val};`).join('\n');
    parts.push(`:root {\n${vars}\n}`);
  }

  if (t.rawCss) {
    parts.push(t.rawCss);
  }

  for (const component of t.components) {
    if (component.css) {
      parts.push(`[data-component="${component.slug}"] {\n${component.css}\n}`);
    }
  }

  const css = parts.join('\n\n');

  if (!styleEl) {
    styleEl = document.getElementById('omnara-theme') as HTMLStyleElement | null;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'omnara-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = css;
}

async function fetchTheme(
  siteId: string,
  apiUrl: string,
  prevEtag?: string,
): Promise<{ theme: SiteTheme | null; etag: string | null }> {
  const headers: Record<string, string> = {};
  if (prevEtag) {
    headers['If-None-Match'] = prevEtag;
  }

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/public/sites/${siteId}/theme`, { headers });
  } catch {
    return { theme: null, etag: prevEtag ?? null };
  }

  if (res.status === 304) {
    return { theme: null, etag: prevEtag ?? null };
  }

  if (res.status === 404) {
    return { theme: null, etag: null };
  }

  if (!res.ok) {
    throw new Error(`Theme fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as SiteTheme;
  const newEtag = res.headers.get('etag');
  return { theme: data, etag: newEtag };
}
