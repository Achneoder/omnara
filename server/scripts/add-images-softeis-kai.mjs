/* eslint-disable no-undef */
/**
 * Downloads images from softeis-kai.de, uploads them to omnara via the MCP
 * upload_asset tool, then updates the relevant page sections to embed the images.
 *
 * Run: node scripts/add-images-softeis-kai.mjs
 * Requires OMNARA_CMS_API_KEY env var.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const API_KEY = process.env.OMNARA_CMS_API_KEY;
const BASE_URL = process.env.OMNARA_BASE_URL ?? 'http://localhost:3000';
const SITE_URL = 'https://softeis-kai.de';

if (!API_KEY) {
  console.error('OMNARA_CMS_API_KEY env var is required');
  process.exit(1);
}

const transport = new SSEClientTransport(new URL(`${BASE_URL}/mcp/sse`), {
  requestInit: { headers: { 'x-api-key': API_KEY } },
  eventSourceInit: {
    fetch: (url, init) =>
      fetch(url, { ...init, headers: { ...(init?.headers ?? {}), 'x-api-key': API_KEY } }),
  },
});

const client = new Client({ name: 'softeis-kai-images', version: '1.0.0' });

async function call(toolName, args) {
  const result = await client.callTool({ name: toolName, arguments: args });
  const text = result.content?.[0]?.text ?? '';
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) throw new Error(String(parsed.error));
    return parsed;
  } catch (_e) {
    if (text.startsWith('MCP error') || text.startsWith('{')) throw new Error(text);
    return text;
  }
}

// ---------------------------------------------------------------------------
// Images scraped from softeis-kai.de — with their semantic role
// ---------------------------------------------------------------------------

const IMAGES = [
  {
    url: `${SITE_URL}/wp-content/uploads/2025/05/Logo-softeis-kai.png`,
    category: 'image',
    role: 'logo',
    alt: 'Softeis Kai Logo',
    pages: ['all'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/06/Kai-Fischer-softeis-kai.webp`,
    category: 'image',
    role: 'portrait',
    alt: 'Kai Fischer – Inhaber Softeis Kai',
    pages: ['startseite'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/06/softeis-kai-eiswagen-maerchen-1.png`,
    category: 'image',
    role: 'eiswagen-maerchen',
    alt: 'Softeis Kai Eiswagen Märchenmotiv',
    pages: ['eiswagen-mieten', 'startseite'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/06/softeis-kai-eiswagen-pinguin-1.png`,
    category: 'image',
    role: 'eiswagen-pinguin',
    alt: 'Softeis Kai Eiswagen Pinguinmotiv',
    pages: ['eiswagen-mieten'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/06/softeis-kai-eiswageneisbaer-1.png`,
    category: 'image',
    role: 'eiswagen-eisbaer',
    alt: 'Softeis Kai Eiswagen Eisbärmotiv',
    pages: ['eiswagen-mieten'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/10/Softeis-kai-Softeisvarianten-2.webp`,
    category: 'image',
    role: 'sortiment',
    alt: 'Softeis Kai – Softeis Varianten Sortiment',
    pages: ['sortiment', 'startseite'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/10/softeis-kai-eiswagen-pinguin-1.webp`,
    category: 'image',
    role: 'eiswagen-pinguin-webp',
    alt: 'Softeis Kai Eiswagen Pinguin',
    pages: ['eiswagen-mieten'],
  },
  {
    url: `${SITE_URL}/wp-content/uploads/2025/11/Softeis-Kai-Softeis-tiefgefroren-4.webp`,
    category: 'image',
    role: 'tiefgefroren',
    alt: 'Softeis Kai – Softeis tiefgefroren',
    pages: ['sortiment', 'eistruhe-mieten'],
  },
];

// ---------------------------------------------------------------------------
// Helper: build an img tag from an uploaded asset
// ---------------------------------------------------------------------------
function imgTag(asset, alt, cssClass = '') {
  const src = `${BASE_URL}${asset.url}`;
  return `<img src="${src}" alt="${alt}" class="${cssClass}" loading="lazy" />`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Connecting to omnara MCP at', BASE_URL);
  await client.connect(transport);
  console.log('Connected.\n');

  // ── 1. Find the softeis-kai site ─────────────────────────────────────────
  console.log('1. Locating site…');
  const sites = await call('list_sites', {});
  const site = sites?.find((s) => s.url === SITE_URL);
  if (!site) {
    console.error('Site not found. Run rebuild-softeis-kai.mjs first.');
    process.exit(1);
  }
  const siteId = site.id;
  console.log(`   Site ID: ${siteId}\n`);

  // ── 2. Upload all images ──────────────────────────────────────────────────
  console.log('2. Uploading images via MCP upload_asset…');
  const uploaded = {};
  for (const img of IMAGES) {
    try {
      const asset = await call('upload_asset', {
        site_id: siteId,
        url: img.url,
        category: img.category,
      });
      uploaded[img.role] = { ...asset, alt: img.alt };
      console.log(`   ✓ ${img.role} → ${asset.url}`);
    } catch (err) {
      console.error(`   ✗ ${img.role}: ${err.message}`);
    }
  }
  console.log();

  // ── 3. Get all pages and their sections ──────────────────────────────────
  console.log('3. Loading pages…');
  const pages = await call('list_pages', { site_id: siteId });
  const pageMap = {};
  for (const p of pages ?? []) {
    const detail = await call('get_page', { site_id: siteId, page_id: p.id });
    pageMap[p.slug] = detail;
    console.log(`   ✓ ${p.slug} (${detail.sections?.length ?? 0} sections)`);
  }
  console.log();

  // ── 4. Update page sections with image props ──────────────────────────────
  console.log('4. Injecting images into page sections…');

  // Helper: find first section with a given component slug
  function findSection(slug, componentSlug) {
    return pageMap[slug]?.sections?.find((s) => s.componentSlug === componentSlug);
  }

  async function updateSection(sectionId, extraProps) {
    const existing = Object.values(pageMap)
      .flatMap((p) => p.sections ?? [])
      .find((s) => s.id === sectionId);
    await call('update_page_section', {
      site_id: siteId,
      section_id: sectionId,
      props: { ...(existing?.props ?? {}), ...extraProps },
    });
  }

  // Startseite: hero gets logo + eiswagen image; portrait section
  const startHero = findSection('startseite', 'hero');
  if (startHero && uploaded.logo) {
    await updateSection(startHero.id, {
      logo_html: imgTag(uploaded.logo, uploaded.logo.alt, 'hero__logo'),
      bg_image_url: uploaded['eiswagen-maerchen']
        ? `${BASE_URL}${uploaded['eiswagen-maerchen'].url}`
        : '',
    });
    console.log('   ✓ startseite / hero: logo + bg image');
  }

  // Startseite: "Softeis ist meine Stärke" text section → sortiment image
  const startText1 = pageMap['startseite']?.sections?.find(
    (s) => s.componentSlug === 'text-section' && s.sortOrder === 1,
  );
  if (startText1 && uploaded.sortiment) {
    await updateSection(startText1.id, {
      image_html: imgTag(uploaded.sortiment, uploaded.sortiment.alt, 'text-section__img'),
    });
    console.log('   ✓ startseite / text-section[1]: sortiment image');
  }

  // Startseite: "Eisspezialitäten Fischer" → portrait of Kai
  const startText3 = pageMap['startseite']?.sections?.find(
    (s) => s.componentSlug === 'text-section' && s.sortOrder === 3,
  );
  if (startText3 && uploaded.portrait) {
    await updateSection(startText3.id, {
      image_html: imgTag(uploaded.portrait, uploaded.portrait.alt, 'text-section__img'),
    });
    console.log('   ✓ startseite / text-section[3]: Kai Fischer portrait');
  }

  // Sortiment: product-grid → sortiment + tiefgefroren images
  const sortimentGrid = findSection('sortiment', 'product-grid');
  if (sortimentGrid) {
    const galleryHtml = [uploaded.sortiment, uploaded.tiefgefroren]
      .filter(Boolean)
      .map((a) => imgTag(a, a.alt, 'sortiment-gallery__img'))
      .join('\n');
    await updateSection(sortimentGrid.id, { gallery_html: galleryHtml });
    console.log('   ✓ sortiment / product-grid: gallery images');
  }

  // Eiswagen mieten: text-section → eiswagen images gallery
  const eiswagenText = findSection('eiswagen-mieten', 'text-section');
  if (eiswagenText) {
    const galleryHtml = [
      uploaded['eiswagen-maerchen'],
      uploaded['eiswagen-pinguin'],
      uploaded['eiswagen-eisbaer'],
      uploaded['eiswagen-pinguin-webp'],
    ]
      .filter(Boolean)
      .map((a) => imgTag(a, a.alt, 'eiswagen-gallery__img'))
      .join('\n');
    await updateSection(eiswagenText.id, { gallery_html: galleryHtml });
    console.log('   ✓ eiswagen-mieten / text-section: eiswagen gallery');
  }

  // Eistruhe mieten: text-section → tiefgefroren image
  const eitruheText = findSection('eistruhe-mieten', 'text-section');
  if (eitruheText && uploaded.tiefgefroren) {
    await updateSection(eitruheText.id, {
      image_html: imgTag(uploaded.tiefgefroren, uploaded.tiefgefroren.alt, 'text-section__img'),
    });
    console.log('   ✓ eistruhe-mieten / text-section: tiefgefroren image');
  }

  console.log();

  // ── 5. Update theme components to render new image props ─────────────────
  console.log('5. Updating theme components to render image props…');

  await call('upsert_theme_component', {
    site_id: siteId,
    slug: 'hero',
    name: 'Hero Section',
    category: 'hero',
    template: `<section class="hero" {{#bg_image_url}}style="background-image:url('{{bg_image_url}}');"{{/bg_image_url}}>
  <div class="hero__overlay"></div>
  <div class="container hero__inner">
    <div class="hero__logo-wrap">{{logo_html}}</div>
    <h1 class="hero__headline">{{headline}}</h1>
    <p class="hero__sub">{{subline}}</p>
    <div class="hero__cta">
      <a href="{{cta_primary_href}}" class="btn btn-primary">{{cta_primary_label}}</a>
      <a href="{{cta_secondary_href}}" class="btn btn-secondary">{{cta_secondary_label}}</a>
    </div>
  </div>
</section>`,
    css: `.hero { position: relative; background: var(--color-bg-alt) center/cover no-repeat; padding: 6rem 0; text-align: center; }
.hero__overlay { position: absolute; inset: 0; background: rgba(0,0,0,.35); }
.hero__inner { position: relative; z-index: 1; }
.hero__logo-wrap { margin-bottom: 1.5rem; }
.hero__logo { height: 80px; width: auto; }
.hero__headline { font-size: 2.75rem; font-weight: 800; margin-bottom: 1rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.5); }
.hero__sub { font-size: 1.25rem; color: rgba(255,255,255,.9); margin-bottom: 2rem; }
.hero__cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }`,
    props_schema: {
      headline: 'headline',
      subline: 'subline',
      cta_primary_label: 'cta_primary_label',
      cta_primary_href: 'cta_primary_href',
      cta_secondary_label: 'cta_secondary_label',
      cta_secondary_href: 'cta_secondary_href',
      logo_html: 'logo_html',
      bg_image_url: 'bg_image_url',
    },
  });
  console.log('   ✓ hero component updated');

  await call('upsert_theme_component', {
    site_id: siteId,
    slug: 'text-section',
    name: 'Text Section',
    category: 'article',
    template: `<section class="text-section">
  <div class="container text-section__inner">
    <div class="text-section__content">
      <h2 class="text-section__headline">{{headline}}</h2>
      <p class="text-section__sub">{{subheadline}}</p>
      <p class="text-section__body">{{body}}</p>
      <a href="{{cta_href}}" class="btn btn-primary text-section__cta">{{cta_label}}</a>
      <div class="text-section__gallery">{{gallery_html}}</div>
    </div>
    <div class="text-section__media">{{image_html}}</div>
  </div>
</section>`,
    css: `.text-section { padding: 4rem 0; }
.text-section__inner { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 1100px; }
@media(min-width:768px) { .text-section__inner { grid-template-columns: 1fr 1fr; align-items: center; } }
.text-section__headline { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.text-section__sub { font-size: 1.1rem; color: var(--color-primary); font-weight: 600; margin-bottom: 1rem; }
.text-section__body { font-size: 1rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.5rem; }
.text-section__cta { display: inline-block; }
.text-section__gallery { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
.text-section__media img, .text-section__img { width: 100%; height: auto; border-radius: var(--radius); object-fit: cover; }
.eiswagen-gallery__img { width: calc(50% - 0.375rem); border-radius: var(--radius); object-fit: cover; }`,
    props_schema: {
      headline: 'headline',
      subheadline: 'subheadline',
      body: 'body',
      cta_label: 'cta_label',
      cta_href: 'cta_href',
      image_html: 'image_html',
      gallery_html: 'gallery_html',
    },
  });
  console.log('   ✓ text-section component updated');

  await call('upsert_theme_component', {
    site_id: siteId,
    slug: 'product-grid',
    name: 'Product Grid',
    category: 'product',
    template: `<section class="product-grid">
  <div class="container">
    <h2 class="product-grid__headline">{{headline}}</h2>
    <p class="product-grid__desc">{{description}}</p>
    <div class="product-grid__gallery">{{gallery_html}}</div>
    <div class="product-grid__items">{{items_html}}</div>
  </div>
</section>`,
    css: `.product-grid { padding: 4rem 0; background: var(--color-bg-alt); }
.product-grid__headline { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.75rem; }
.product-grid__desc { text-align: center; color: var(--color-text-muted); margin-bottom: 2rem; }
.product-grid__gallery { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
.sortiment-gallery__img { width: 320px; max-width: 100%; height: 240px; object-fit: cover; border-radius: var(--radius); }
.product-grid__items { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
.product-card { background: #fff; border-radius: var(--radius); padding: 1.25rem; text-align: center; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }`,
    props_schema: {
      headline: 'headline',
      description: 'description',
      items_html: 'items_html',
      gallery_html: 'gallery_html',
    },
  });
  console.log('   ✓ product-grid component updated');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✓ ${Object.keys(uploaded).length} images uploaded and wired into omnara!`);
  console.log(`  Site ID: ${siteId}`);
  for (const [role, asset] of Object.entries(uploaded)) {
    console.log(`  ${role}: ${BASE_URL}${asset.url}`);
  }
  console.log('═══════════════════════════════════════════════════════');

  await client.close();
}

main().catch((err) => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
