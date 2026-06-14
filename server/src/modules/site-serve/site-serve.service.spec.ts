import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SiteServeService } from './site-serve.service.js';
import { ContentStatus } from '../content-entries/entities/content-entry.entity.js';
import { ThemesService } from '../themes/themes.service.js';
import { SitesService } from '../sites/sites.service.js';
import { SiteTheme } from '../themes/entities/site-theme.entity.js';
import { ThemeComponent, ComponentCategory } from '../themes/entities/theme-component.entity.js';
import { Collection } from '@mikro-orm/core';

const mockEm = {
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
};

const mockThemesService = {
  getTheme: jest.fn(),
};

const mockSitesService = {
  findOne: jest.fn(),
};

function makeSite(overrides: Partial<{ id: string; name: string; url: string }> = {}) {
  return {
    id: overrides.id ?? 'site-1',
    name: overrides.name ?? 'Test Site',
    url: overrides.url ?? 'https://example.com',
  };
}

function makeTheme(
  overrides: Partial<{
    id: string;
    name: string;
    version: string;
    tokens: Record<string, string>;
    rawCss: string | null;
    components: ThemeComponent[];
  }> = {},
): SiteTheme {
  const components = overrides.components ?? [];
  const collection = new Collection<ThemeComponent>({} as SiteTheme, components);
  return {
    id: overrides.id ?? 'theme-1',
    name: overrides.name ?? 'Test Theme',
    version: overrides.version ?? '1.0.0',
    tokens: overrides.tokens ?? { '--color-primary': '#ff0000' },
    rawCss: overrides.rawCss ?? null,
    components: collection,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SiteTheme;
}

function makeComponent(
  overrides: Partial<{
    slug: string;
    name: string;
    template: string;
    css: string | null;
    propsSchema: Record<string, string>;
    category: ComponentCategory;
  }> = {},
): ThemeComponent {
  return {
    slug: overrides.slug ?? 'hero',
    name: overrides.name ?? 'Hero',
    template: overrides.template ?? '<section>{{title}}</section>',
    css: overrides.css ?? null,
    propsSchema: overrides.propsSchema ?? { title: 'title' },
    category: overrides.category ?? ComponentCategory.HERO,
  } as ThemeComponent;
}

function makeContentType(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    fieldSchema: Record<string, unknown> | null;
    component: ThemeComponent | null;
  }> = {},
) {
  return {
    id: overrides.id ?? 'ct-1',
    name: overrides.name ?? 'Blog Post',
    slug: overrides.slug ?? 'blog',
    fieldSchema: overrides.fieldSchema ?? { title: { type: 'string' } },
    component: overrides.component ?? null,
  };
}

function makeEntry(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    body: Record<string, unknown> | null;
    status: ContentStatus;
    publishedAt: Date | null;
    contentType: ReturnType<typeof makeContentType>;
  }> = {},
) {
  return {
    id: overrides.id ?? 'entry-1',
    title: overrides.title ?? 'Hello World',
    slug: overrides.slug ?? 'hello-world',
    body: overrides.body ?? { title: 'Hello World', body: 'This is a post.' },
    status: overrides.status ?? ContentStatus.LIVE,
    publishedAt: overrides.publishedAt ?? new Date('2026-06-01'),
    contentType: overrides.contentType ?? makeContentType(),
  };
}

describe('SiteServeService', () => {
  let service: SiteServeService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteServeService,
        { provide: EntityManager, useValue: mockEm },
        { provide: ThemesService, useValue: mockThemesService },
        { provide: SitesService, useValue: mockSitesService },
      ],
    }).compile();

    service = module.get<SiteServeService>(SiteServeService);
  });

  // ---------------------------------------------------------------------------
  // renderHomePage
  // ---------------------------------------------------------------------------

  describe('renderHomePage', () => {
    it('throws NotFoundException when site does not exist', async () => {
      mockSitesService.findOne.mockRejectedValueOnce(
        new NotFoundException('Site site-1 not found'),
      );

      await expect(service.renderHomePage('site-1')).rejects.toThrow(NotFoundException);
    });

    it('returns an HTML document with DOCTYPE', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="en">');
    });

    it('includes site name in the title and navigation', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite({ name: 'My Site' }));
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('<title>My Site</title>');
      expect(result).toContain('My Site');
    });

    it('lists content types with links to their entry pages', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([ct]);
      mockEm.count.mockResolvedValueOnce(3);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('/s/site-1/blog');
      expect(result).toContain('Blog');
      expect(result).toContain('(3 entries)');
    });

    it('shows empty state when no content types exist', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('No content types');
    });

    it('injects theme tokens as CSS custom properties', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(
        makeTheme({ tokens: { '--color-primary': '#ff0000', '--font-sans': 'Inter' } }),
      );
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('--color-primary: #ff0000');
      expect(result).toContain('--font-sans: Inter');
    });

    it('handles null theme gracefully', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<main>');
    });

    it('includes component-scoped CSS when theme has components', async () => {
      const component = makeComponent({
        slug: 'hero',
        css: 'padding: 2rem;',
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(makeTheme({ components: [component] }));
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('[data-component="hero"]');
      expect(result).toContain('padding: 2rem;');
    });

    it('includes raw CSS from theme', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(
        makeTheme({ rawCss: 'body { font-family: sans-serif; }' }),
      );
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderHomePage('site-1');

      expect(result).toContain('body { font-family: sans-serif; }');
    });
  });

  // ---------------------------------------------------------------------------
  // renderContentTypesPage
  // ---------------------------------------------------------------------------

  describe('renderContentTypesPage', () => {
    it('throws NotFoundException when site does not exist', async () => {
      mockSitesService.findOne.mockRejectedValueOnce(
        new NotFoundException('Site site-1 not found'),
      );

      await expect(service.renderContentTypesPage('site-1')).rejects.toThrow(NotFoundException);
    });

    it('returns an HTML document with content type listing', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.find.mockResolvedValueOnce([ct]);
      mockEm.count.mockResolvedValueOnce(5);

      const result = await service.renderContentTypesPage('site-1');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Content Types');
      expect(result).toContain('(5 entries)');
    });
  });

  // ---------------------------------------------------------------------------
  // renderEntryListPage
  // ---------------------------------------------------------------------------

  describe('renderEntryListPage', () => {
    it('throws NotFoundException when site does not exist', async () => {
      mockSitesService.findOne.mockRejectedValueOnce(
        new NotFoundException('Site site-1 not found'),
      );

      await expect(service.renderEntryListPage('site-1', 'blog')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when content type does not exist', async () => {
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(null);

      await expect(service.renderEntryListPage('site-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lists published entries for the content type', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      const entry = makeEntry({
        title: 'Hello World',
        slug: 'hello-world',
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct);
      mockEm.find.mockResolvedValueOnce([entry]);

      const result = await service.renderEntryListPage('site-1', 'blog');

      expect(result).toContain('Hello World');
      expect(result).toContain('/s/site-1/blog/hello-world');
      expect(result).toContain('Back to all content types');
    });

    it('shows empty state when no published entries exist', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct);
      mockEm.find.mockResolvedValueOnce([]);

      const result = await service.renderEntryListPage('site-1', 'blog');

      expect(result).toContain('No published entries');
    });

    it('excludes non-live entries by querying with LIVE status filter', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct);
      mockEm.find.mockResolvedValueOnce([]);

      await service.renderEntryListPage('site-1', 'blog');

      expect(mockEm.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: ContentStatus.LIVE }),
        expect.anything(),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // renderEntryDetailPage
  // ---------------------------------------------------------------------------

  describe('renderEntryDetailPage', () => {
    it('throws NotFoundException when entry does not exist', async () => {
      const ct = makeContentType({ slug: 'blog' });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne
        .mockResolvedValueOnce(ct) // content type lookup
        .mockResolvedValueOnce(null); // entry lookup

      await expect(service.renderEntryDetailPage('site-1', 'blog', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('renders entry title and publication date', async () => {
      const ct = makeContentType({ name: 'Blog', slug: 'blog' });
      const entry = makeEntry({
        title: 'Hello World',
        slug: 'hello-world',
        contentType: ct,
        publishedAt: new Date('2026-06-01'),
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'blog', 'hello-world');

      expect(result).toContain('Hello World');
      expect(result).toContain('<article>');
    });

    it('renders using component template when content type has an assigned component', async () => {
      const component = makeComponent({
        slug: 'hero',
        template: '<section><h1>{{title}}</h1><p>{{body}}</p></section>',
        propsSchema: { title: 'title', body: 'body' },
      });
      const ct = makeContentType({ name: 'Blog', slug: 'blog', component });
      const entry = makeEntry({
        title: 'Hello',
        slug: 'hello',
        body: { title: 'Hello', body: 'World' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'blog', 'hello');

      expect(result).toContain('<h1>Hello</h1>');
      expect(result).toContain('<p>World</p>');
      expect(result).toContain('data-component="hero"');
    });

    it('escapes HTML special characters in template values', async () => {
      const component = makeComponent({
        slug: 'card',
        template: '<div>{{content}}</div>',
        propsSchema: { content: 'body' },
      });
      const ct = makeContentType({ name: 'Blog', slug: 'blog', component });
      const entry = makeEntry({
        title: 'XSS Test',
        slug: 'xss',
        body: { body: '<script>alert("xss")</script>' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'blog', 'xss');

      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;alert');
    });

    it('falls back to semantic field rendering when no component is assigned', async () => {
      const ct = makeContentType({
        name: 'Blog',
        slug: 'blog',
        fieldSchema: { title: { type: 'string' }, body: { type: 'richtext' } },
        component: null,
      });
      const entry = makeEntry({
        title: 'My Post',
        slug: 'my-post',
        body: { title: 'My Post', body: '<p>Rich content</p>' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'blog', 'my-post');

      expect(result).toContain('My Post');
      // richtext field should render HTML as-is (not escaped)
      expect(result).toContain('<p>Rich content</p>');
      expect(result).toContain('class="field field-body"');
    });

    it('renders richtext body fields without HTML escaping', async () => {
      const ct = makeContentType({
        name: 'Page',
        slug: 'page',
        fieldSchema: { richtext_body: { type: 'richtext' } },
        component: null,
      });
      const entry = makeEntry({
        title: 'About',
        slug: 'about',
        body: { richtext_body: '<h2>About Us</h2><p>We are <strong>great</strong>.</p>' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'page', 'about');

      expect(result).toContain('<h2>About Us</h2>');
      expect(result).toContain('<strong>great</strong>');
    });

    it('renders URL fields as clickable links', async () => {
      const ct = makeContentType({
        name: 'Link',
        slug: 'link',
        fieldSchema: { website: { type: 'url' } },
        component: null,
      });
      const entry = makeEntry({
        title: 'My Link',
        slug: 'my-link',
        body: { website: 'https://example.com' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'link', 'my-link');

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
    });

    it('skips null body values in semantic rendering', async () => {
      const ct = makeContentType({
        name: 'Post',
        slug: 'post',
        fieldSchema: { title: { type: 'string' }, subtitle: { type: 'string' } },
        component: null,
      });
      const entry = makeEntry({
        title: 'Post',
        slug: 'post',
        body: { title: 'Title Only', subtitle: null },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'post', 'post');

      expect(result).toContain('Title Only');
      // subtitle should be omitted because value is null
      expect(result).not.toContain('subtitle');
    });

    it('handles template placeholders that reference missing body keys', async () => {
      const component = makeComponent({
        slug: 'card',
        template: '<div>{{existing}}{{missing}}</div>',
        propsSchema: { existing: 'title' },
      });
      const ct = makeContentType({ name: 'Post', slug: 'post', component });
      const entry = makeEntry({
        title: 'Post',
        slug: 'post',
        body: { title: 'Hello' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'post', 'post');

      expect(result).toContain('Hello');
      // missing placeholder should render empty string
      expect(result).toContain('<div>Hello</div>');
    });

    it('handles template placeholders not in propsSchema by falling back to placeholder name as body key', async () => {
      const component = makeComponent({
        slug: 'card',
        template: '<div>{{directKey}}</div>',
        propsSchema: {},
      });
      const ct = makeContentType({ name: 'Post', slug: 'post', component });
      const entry = makeEntry({
        title: 'Post',
        slug: 'post',
        body: { directKey: 'direct value' },
        contentType: ct,
      });
      mockSitesService.findOne.mockResolvedValueOnce(makeSite());
      mockThemesService.getTheme.mockResolvedValueOnce(null);
      mockEm.findOne.mockResolvedValueOnce(ct).mockResolvedValueOnce(entry);

      const result = await service.renderEntryDetailPage('site-1', 'post', 'post');

      expect(result).toContain('direct value');
    });
  });
});
