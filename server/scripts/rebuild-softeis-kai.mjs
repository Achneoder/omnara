/* eslint-disable no-undef */
/**
 * Rebuilds softeis-kai.de in omnara via the MCP server.
 * Run: node scripts/rebuild-softeis-kai.mjs
 *
 * Idempotent: lists existing sites first and reuses the softeis-kai site if found.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const API_KEY = process.env.OMNARA_CMS_API_KEY;
const BASE_URL = process.env.OMNARA_BASE_URL ?? 'http://localhost:3000';

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

const client = new Client({ name: 'softeis-kai-rebuild', version: '1.0.0' });

async function call(toolName, args) {
  const result = await client.callTool({ name: toolName, arguments: args });
  const text = result.content?.[0]?.text ?? '';
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) throw new Error(parsed.error);
    return parsed;
  } catch (_e) {
    if (text.startsWith('MCP error') || text.includes('error')) {
      throw new Error(text);
    }
    return text;
  }
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const ICE_CREAM_FLAVORS = [
  'Vanille',
  'Vanille - Schoko',
  'Banane - Schoko',
  'Eierlikör - Schoko',
  'Nuss-Nougat - Vanille',
  'Kokos - Weiße Schokolade',
  'Erdbeere - Vanille',
  'Heidelbeere - Vanille',
  'Joghurt - Himbeere',
  'Joghurt - Pfirsich',
  'Kirsche - Vanille',
  'Zitrone - Vanille',
  'Mango - Vanille',
  'Karamell - Vanille',
  'Pistazie - Vanille',
  'Schokolade',
];

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Theme: components for the softeis-kai layout
// ---------------------------------------------------------------------------

const THEME = {
  name: 'Softeis Kai Theme',
  version: '1.0.0',
  tokens: {
    '--color-primary': '#f97316',
    '--color-primary-dark': '#ea580c',
    '--color-secondary': '#fef3c7',
    '--color-text': '#1f2937',
    '--color-text-muted': '#6b7280',
    '--color-bg': '#ffffff',
    '--color-bg-alt': '#fff7ed',
    '--font-sans': "'Inter', system-ui, sans-serif",
    '--radius': '0.75rem',
    '--max-width': '1200px',
  },
  raw_css: `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); }
a { color: var(--color-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 1.5rem; }
.btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: var(--radius); font-weight: 600; cursor: pointer; border: none; font-size: 1rem; }
.btn-primary { background: var(--color-primary); color: #fff; }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-secondary { background: transparent; color: var(--color-primary); border: 2px solid var(--color-primary); }
  `.trim(),
};

const COMPONENTS = [
  {
    slug: 'hero',
    name: 'Hero Section',
    category: 'hero',
    template: `<section class="hero">
  <div class="container hero__inner">
    <h1 class="hero__headline">{{headline}}</h1>
    <p class="hero__sub">{{subline}}</p>
    <div class="hero__cta">
      <a href="{{cta_primary_href}}" class="btn btn-primary">{{cta_primary_label}}</a>
      <a href="{{cta_secondary_href}}" class="btn btn-secondary">{{cta_secondary_label}}</a>
    </div>
  </div>
</section>`,
    css: `.hero { background: var(--color-bg-alt); padding: 5rem 0; text-align: center; }
.hero__headline { font-size: 2.75rem; font-weight: 800; margin-bottom: 1rem; color: var(--color-text); }
.hero__sub { font-size: 1.25rem; color: var(--color-text-muted); margin-bottom: 2rem; }
.hero__cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }`,
    props_schema: {
      headline: 'headline',
      subline: 'subline',
      cta_primary_label: 'cta_primary_label',
      cta_primary_href: 'cta_primary_href',
      cta_secondary_label: 'cta_secondary_label',
      cta_secondary_href: 'cta_secondary_href',
    },
  },
  {
    slug: 'text-section',
    name: 'Text Section',
    category: 'article',
    template: `<section class="text-section">
  <div class="container text-section__inner">
    <h2 class="text-section__headline">{{headline}}</h2>
    <p class="text-section__sub">{{subheadline}}</p>
    <p class="text-section__body">{{body}}</p>
    <a href="{{cta_href}}" class="btn btn-primary text-section__cta">{{cta_label}}</a>
  </div>
</section>`,
    css: `.text-section { padding: 4rem 0; }
.text-section__inner { max-width: 800px; }
.text-section__headline { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.text-section__sub { font-size: 1.1rem; color: var(--color-primary); font-weight: 600; margin-bottom: 1rem; }
.text-section__body { font-size: 1rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.5rem; }
.text-section__cta { display: inline-block; }`,
    props_schema: {
      headline: 'headline',
      subheadline: 'subheadline',
      body: 'body',
      cta_label: 'cta_label',
      cta_href: 'cta_href',
    },
  },
  {
    slug: 'product-grid',
    name: 'Product Grid',
    category: 'product',
    template: `<section class="product-grid">
  <div class="container">
    <h2 class="product-grid__headline">{{headline}}</h2>
    <p class="product-grid__desc">{{description}}</p>
    <div class="product-grid__items">{{items_html}}</div>
  </div>
</section>`,
    css: `.product-grid { padding: 4rem 0; background: var(--color-bg-alt); }
.product-grid__headline { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.75rem; }
.product-grid__desc { text-align: center; color: var(--color-text-muted); margin-bottom: 2rem; }
.product-grid__items { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
.product-card { background: #fff; border-radius: var(--radius); padding: 1.25rem; text-align: center; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }`,
    props_schema: {
      headline: 'headline',
      description: 'description',
      items_html: 'items_html',
    },
  },
  {
    slug: 'faq',
    name: 'FAQ Section',
    category: 'misc',
    template: `<section class="faq">
  <div class="container">
    <h2 class="faq__headline">{{headline}}</h2>
    <div class="faq__items">{{items_html}}</div>
  </div>
</section>`,
    css: `.faq { padding: 4rem 0; }
.faq__headline { font-size: 2rem; font-weight: 700; margin-bottom: 2rem; }
.faq-item { border: 1px solid #e5e7eb; border-radius: var(--radius); padding: 1.25rem; margin-bottom: 1rem; }
.faq-item__q { font-weight: 700; margin-bottom: 0.5rem; }
.faq-item__a { color: var(--color-text-muted); line-height: 1.6; }`,
    props_schema: {
      headline: 'headline',
      items_html: 'items_html',
    },
  },
  {
    slug: 'contact',
    name: 'Contact Section',
    category: 'misc',
    template: `<section class="contact">
  <div class="container">
    <h2 class="contact__headline">{{headline}}</h2>
    <p class="contact__body">{{body}}</p>
    <div class="contact__details">
      <p>📞 <a href="tel:{{phone_raw}}">{{phone}}</a></p>
      <p>✉️ <a href="mailto:{{email}}">{{email}}</a></p>
      <p>📍 {{address}}</p>
    </div>
    <form class="contact__form" method="post">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="E-Mail" required />
      <input name="phone" placeholder="Telefon" />
      <textarea name="message" placeholder="Nachricht" rows="5" required></textarea>
      <button type="submit" class="btn btn-primary">Senden</button>
    </form>
  </div>
</section>`,
    css: `.contact { padding: 4rem 0; background: var(--color-bg-alt); }
.contact__headline { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
.contact__body { color: var(--color-text-muted); margin-bottom: 1.5rem; }
.contact__details { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
.contact__form { display: flex; flex-direction: column; gap: 1rem; max-width: 600px; }
.contact__form input, .contact__form textarea {
  padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: var(--radius); font-size: 1rem; font-family: inherit; }
.contact__form textarea { resize: vertical; }`,
    props_schema: {
      headline: 'headline',
      body: 'body',
      phone: 'phone',
      phone_raw: 'phone_raw',
      email: 'email',
      address: 'address',
    },
  },
  {
    slug: 'imprint',
    name: 'Imprint / Legal Text',
    category: 'misc',
    template: `<section class="imprint">
  <div class="container">
    <h1 class="imprint__headline">{{headline}}</h1>
    <div class="imprint__body">{{body_html}}</div>
  </div>
</section>`,
    css: `.imprint { padding: 4rem 0; }
.imprint__headline { font-size: 2rem; font-weight: 700; margin-bottom: 2rem; }
.imprint__body { line-height: 1.8; white-space: pre-line; color: var(--color-text-muted); }`,
    props_schema: { headline: 'headline', body_html: 'body_html' },
  },
];

// ---------------------------------------------------------------------------
// Pages + their sections
// ---------------------------------------------------------------------------

function flavorCard(name) {
  return `<div class="product-card">${name}</div>`;
}

function faqItem(q, a) {
  return `<div class="faq-item"><p class="faq-item__q">${q}</p><p class="faq-item__a">${a}</p></div>`;
}

const PAGES = [
  {
    title: 'Startseite',
    slug: 'startseite',
    is_homepage: true,
    status: 'published',
    sections: [
      {
        component_slug: 'hero',
        props: {
          headline: 'Softeis Kai – Ihr mobiler Softeis Dealer',
          subline: 'Hausgemachtes Softeis aus regionalen Zutaten seit 25 Jahren',
          cta_primary_label: 'Eiswagen mieten',
          cta_primary_href: '/eiswagen-mieten',
          cta_secondary_label: 'Zum Sortiment',
          cta_secondary_href: '/sortiment',
        },
      },
      {
        component_slug: 'text-section',
        props: {
          headline: 'Softeis ist meine Stärke',
          subheadline: '',
          body: 'Wir stellen seit 25 Jahren hausgemachtes Softeis aus regionalen Zutaten her. Entdecken Sie unsere 16 Sorten feinsten Softeis, hergestellt im Leipziger Land in unserem schönen Sachsen. Wir verkaufen in kleinen oder großen Mengen und beliefern z.B. Schulen oder Kitas.',
          cta_label: 'Zu unseren Sorten',
          cta_href: '/sortiment',
        },
      },
      {
        component_slug: 'text-section',
        props: {
          headline: 'Eiswagenvermietung für Ihr Event',
          subheadline: 'Softeis Wagen inklusive Personal',
          body: 'Machen Sie Ihr Event zum unvergesslichen Highlight – mit unseren charmanten Eiswagen! Ob Firmenfeier, Dorffest oder besondere Anlässe: Wir bringen Ihnen feinste Eiskreationen direkt an den Veranstaltungsort, Personal inklusive.',
          cta_label: 'Eiswagen mieten',
          cta_href: '/eiswagen-mieten',
        },
      },
      {
        component_slug: 'text-section',
        props: {
          headline: 'Eisspezialitäten Fischer',
          subheadline: 'Herstellung mit Tradition',
          body: 'Ursprünglich eine Bäckerei des Familienbetriebs der Familie Fischer, setzte Kai Fischer alles auf eine Karte: die Produktionsstätte wurde für die Herstellung von Softeis umgebaut. Und das mit Erfolg: mittlerweile zählt Softeis Kai große Lebensmittelhändler zu seinen Kunden.',
          cta_label: 'Kontakt aufnehmen',
          cta_href: '/kontakt',
        },
      },
      {
        component_slug: 'contact',
        props: {
          headline: 'Nehmen Sie Kontakt auf',
          body: 'Senden Sie uns Ihre Anfrage über das Formular oder rufen Sie uns direkt an.',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Sortiment',
    slug: 'sortiment',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'product-grid',
        props: {
          headline: 'Feinstes Softeis in traumhaften Sorten',
          description:
            'Unser Softeis wird aus regionalen Zutaten hergestellt. Wählen Sie aus insgesamt 16 leckeren Sorten Ihr Lieblingseis. Wir beliefern in praktischen Bechern für Schulen, Kitas und Events.',
          items_html: ICE_CREAM_FLAVORS.map(flavorCard).join('\n'),
        },
      },
    ],
  },
  {
    title: 'Eiswagen mieten',
    slug: 'eiswagen-mieten',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'text-section',
        props: {
          headline: 'Eiswagenvermietung für Ihr Event',
          subheadline: 'Softeis Wagen inklusive Personal',
          body: 'Machen Sie Ihr Event zum unvergesslichen Highlight – mit unseren charmanten Eiswagen! Ob Firmenfeier, Sommerfest, Sportfest oder besondere Anlässe: Wir bringen Ihnen feinste Eiskreationen direkt an den Veranstaltungsort, Personal inklusive. Wählen Sie Ihre Lieblingssorten und verwöhnen Sie Ihre Gäste mit cremigem Genuss, der auf der Zunge zergeht.',
          cta_label: 'Jetzt anfragen',
          cta_href: '/kontakt',
        },
      },
      {
        component_slug: 'faq',
        props: {
          headline: 'Wie miete ich einen Eiswagen?',
          items_html: [
            faqItem(
              'Voraussetzungen',
              'Alle Eiswagen werden immer mit Personal vermietet. So müssen Sie sich während Ihres Events um nichts kümmern.',
            ),
            faqItem(
              'Buchung',
              'Einfach das Kontaktformular ausfüllen oder direkt anrufen: 0173 – 566 72 72',
            ),
            faqItem(
              'Einsatzgebiete',
              'Firmenfeier, Dorffest, Sommerfest, Sportfest, Schulanfang, Geburtstag und viele weitere Anlässe.',
            ),
          ].join('\n'),
        },
      },
      {
        component_slug: 'contact',
        props: {
          headline: 'Jetzt Mietanfrage senden',
          body: 'Füllen Sie das Formular aus oder rufen Sie uns direkt an.',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Kühl- & Tiefkühlanhänger mieten',
    slug: 'kuehlanhaenger-mieten',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'text-section',
        props: {
          headline: 'Kühl- & Tiefkühlanhänger mieten',
          subheadline: 'Die mobile Kühlung für jeden Zweck',
          body: 'Unsere mobilen Kühl- und Tiefkühlanhänger sind leistungsstark und einfach zu bedienen. Sie eignen sich zum Beispiel für private Feiern, Firmen-Events oder Sport- und Vereinsfeste. Unsere Anhänger werden betriebsbereit übergeben – einfach anschließen und kühlen.',
          cta_label: 'Jetzt anfragen',
          cta_href: '/kontakt',
        },
      },
      {
        component_slug: 'faq',
        props: {
          headline: 'Wie miete ich einen Kühl- oder Tiefkühlanhänger?',
          items_html: [
            faqItem(
              'Mietdauer',
              'Unsere Anhänger können stunden- oder tageweise gemietet werden, ganz nach Ihrem Bedarf.',
            ),
            faqItem(
              'Buchung',
              'Einfach das Kontaktformular ausfüllen oder direkt anrufen: 0173 – 566 72 72',
            ),
          ].join('\n'),
        },
      },
      {
        component_slug: 'contact',
        props: {
          headline: 'Jetzt Mietanfrage senden',
          body: 'Füllen Sie das Formular aus oder rufen Sie uns direkt an.',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Eistruhe mieten',
    slug: 'eistruhe-mieten',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'text-section',
        props: {
          headline: 'Eistruhe mieten',
          subheadline: 'auf Wunsch auch befüllt',
          body: 'Ob für Ihre Firmenfeier, ein Sommerfest oder ein Event mit Freunden – mit unserer hochwertigen Eistruhe bietet sich die perfekte Möglichkeit, gekühltes Eis ganz unkompliziert bereitzustellen. Auf Wunsch befüllen wir die Eistruhe mit Softeis Ihrer Wahl.',
          cta_label: 'Jetzt anfragen',
          cta_href: '/kontakt',
        },
      },
      {
        component_slug: 'faq',
        props: {
          headline: 'Wie miete ich eine Eistruhe?',
          items_html: faqItem(
            'Mietdauer',
            'Unsere Eistruhen können stunden- oder tageweise gemietet werden, ganz nach Ihrem Bedarf.',
          ),
        },
      },
      {
        component_slug: 'contact',
        props: {
          headline: 'Jetzt Mietanfrage senden',
          body: 'Füllen Sie das Formular aus oder rufen Sie uns direkt an.',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Zuckerwattemaschine mieten',
    slug: 'zuckerwattemaschine-mieten',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'text-section',
        props: {
          headline: 'Zuckerwattemaschine mieten',
          subheadline: 'Süße Wolken für Ihr Event',
          body: 'Bringen Sie fröhliche Volksfest-Atmosphäre auf Ihre Veranstaltung! Mit unserer professionellen Zuckerwattemaschine zaubern Sie im Handumdrehen fluffige Zuckerwatte – ein Highlight für Kinder und Erwachsene gleichermaßen, zum Beispiel zu Schulanfang oder zur Geburtstagsfeier.',
          cta_label: 'Jetzt anfragen',
          cta_href: '/kontakt',
        },
      },
      {
        component_slug: 'faq',
        props: {
          headline: 'Wie miete ich eine Zuckerwattemaschine?',
          items_html: faqItem(
            'Mietdauer',
            'Unsere Zuckerwattemaschine kann tageweise gemietet werden. Einfach das Kontaktformular ausfüllen oder anrufen.',
          ),
        },
      },
      {
        component_slug: 'contact',
        props: {
          headline: 'Jetzt Mietanfrage senden',
          body: 'Füllen Sie das Formular aus oder rufen Sie uns direkt an.',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Kontakt',
    slug: 'kontakt',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'contact',
        props: {
          headline: 'Nehmen Sie Kontakt auf',
          body: 'Senden Sie uns Ihre Anfrage über das Formular oder rufen Sie mich an unter: 0173 – 566 72 72',
          phone: '0173 – 566 72 72',
          phone_raw: '+491735667272',
          email: 'luftballonmann@web.de',
          address: 'Eisspezialitäten Kai Fischer, Hauptstraße 25, D-04567 Hainichen',
        },
      },
    ],
  },
  {
    title: 'Impressum',
    slug: 'impressum',
    is_homepage: false,
    status: 'published',
    sections: [
      {
        component_slug: 'imprint',
        props: {
          headline: 'Impressum',
          body_html:
            'Inhaber | Geschäftsführer: Kai Fischer\nRechnungsanschrift/Sitz: Eisspezialitäten Kai Fischer\nHauptstraße 25, D-04567 Hainichen\n\nKontakt:\nFunk: +49(0) 173 – 566 72 72\nEmail: luftballonmann@web.de\n\nSitz des Finanzamtes: Finanzamt Borna\nBrauhausstr. 8, 04552 Borna\n\nSteuernummer: 235/219/05298',
        },
      },
    ],
  },
];

const NAV = {
  header: [
    { label: 'Startseite', url: '/' },
    { label: 'Sortiment', url: '/sortiment' },
    { label: 'Eiswagen mieten', url: '/eiswagen-mieten' },
    { label: 'Kühl- & Tiefkühlanhänger mieten', url: '/kuehlanhaenger-mieten' },
    { label: 'Eistruhe mieten', url: '/eistruhe-mieten' },
    { label: 'Zuckerwattemaschine mieten', url: '/zuckerwattemaschine-mieten' },
    { label: 'Kontakt', url: '/kontakt' },
  ],
  footer: [
    { label: 'Startseite', url: '/' },
    { label: 'Sortiment', url: '/sortiment' },
    { label: 'Eiswagen mieten', url: '/eiswagen-mieten' },
    { label: 'Kühl- und Tiefkühlanhänger mieten', url: '/kuehlanhaenger-mieten' },
    { label: 'Eistruhe mieten', url: '/eistruhe-mieten' },
    { label: 'Zuckerwattemaschine mieten', url: '/zuckerwattemaschine-mieten' },
    { label: 'Kontakt', url: '/kontakt' },
    { label: 'Impressum', url: '/impressum' },
  ],
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Connecting to omnara MCP at', BASE_URL);
  await client.connect(transport);
  console.log('Connected.\n');

  // ── 1. Get or create site ─────────────────────────────────────────────────
  console.log('1. Site…');
  const sitesResult = await call('list_sites', {});
  const existing = sitesResult?.find?.((s) => s.url === 'https://softeis-kai.de');
  let siteId;

  if (existing) {
    siteId = existing.id;
    console.log(`   Reusing existing site: ${siteId}\n`);
  } else {
    const site = await call('create_site', {
      name: 'Softeis Kai',
      url: 'https://softeis-kai.de',
      platform: 'custom',
      settings: {
        owner: 'Kai Fischer',
        company: 'Eisspezialitäten Kai Fischer',
        phone: '0173 – 566 72 72',
        email: 'luftballonmann@web.de',
        address: 'Hauptstraße 25, D-04567 Hainichen',
        taxNumber: '235/219/05298',
      },
    });
    siteId = site?.id;
    console.log(`   Created site: ${siteId}\n`);
  }

  if (!siteId) throw new Error('Could not get site ID');

  // ── 2. Import theme ───────────────────────────────────────────────────────
  console.log('2. Importing theme + components…');
  await call('import_theme', {
    site_id: siteId,
    theme: THEME,
    components: COMPONENTS,
  });
  console.log(`   ✓ Theme imported with ${COMPONENTS.length} components\n`);

  // ── 3. Content type: Softeis-Sorte ────────────────────────────────────────
  console.log('3. Content type "Softeis-Sorte"…');
  const ctResult = await call('create_content_type', {
    site_id: siteId,
    name: 'Softeis-Sorte',
    slug: 'softeis-sorte',
    field_schema: { name: { type: 'string', required: true } },
  });
  const contentTypeId = ctResult?.id;
  console.log(`   ID: ${contentTypeId}\n`);

  // ── 4. Ice cream entries ──────────────────────────────────────────────────
  console.log('4. Creating 16 ice cream flavor entries…');
  for (const flavor of ICE_CREAM_FLAVORS) {
    await call('create_content_entry', {
      site_id: siteId,
      content_type_id: contentTypeId,
      title: flavor,
      slug: toSlug(flavor),
      body: { name: flavor },
      status: 'live',
    });
    process.stdout.write(`   ✓ ${flavor}\n`);
  }
  console.log();

  // ── 5. Pages + sections ───────────────────────────────────────────────────
  console.log('5. Creating pages + sections…');
  for (const page of PAGES) {
    const created = await call('create_page', {
      site_id: siteId,
      title: page.title,
      slug: page.slug,
      is_homepage: page.is_homepage,
      status: page.status,
      meta: { description: page.sections?.[0]?.props?.body?.slice?.(0, 155) ?? '' },
    });
    const pageId = created?.id;
    console.log(`   ✓ ${page.title} (${pageId})`);

    for (const [i, section] of page.sections.entries()) {
      await call('add_page_section', {
        site_id: siteId,
        page_id: pageId,
        component_slug: section.component_slug,
        sort_order: i,
        props: section.props,
      });
      process.stdout.write(`     + section: ${section.component_slug}\n`);
    }
  }
  console.log();

  // ── 6. Navigation ─────────────────────────────────────────────────────────
  console.log('6. Creating navigation…');
  for (const [menuName, items] of Object.entries(NAV)) {
    for (const [i, item] of items.entries()) {
      await call('create_menu_item', {
        site_id: siteId,
        label: item.label,
        url: item.url,
        sort_order: i,
        menu_name: menuName,
      });
    }
    console.log(`   ✓ ${menuName}: ${items.length} items`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✓ softeis-kai.de has been fully rebuilt in omnara!');
  console.log(`  Site ID: ${siteId}`);
  console.log('═══════════════════════════════════════════════════════');

  await client.close();
}

main().catch((err) => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
