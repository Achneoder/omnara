import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentEntry, ContentStatus } from '../content-entries/entities/content-entry.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Page, PageStatus } from '../pages/entities/page.entity.js';
import { PageSection } from '../pages/entities/page-section.entity.js';
import { SiteTheme } from '../themes/entities/site-theme.entity.js';
import { ThemeComponent } from '../themes/entities/theme-component.entity.js';
import { ThemesService } from '../themes/themes.service.js';
import { SitesService } from '../sites/sites.service.js';

@Injectable()
export class SiteServeService {
  constructor(
    private readonly em: EntityManager,
    private readonly themesService: ThemesService,
    private readonly sitesService: SitesService,
  ) {}

  async renderHomePage(siteId: string): Promise<string> {
    // Check for a published homepage page first
    const homepagePage = await this.em.findOne(Page, {
      site: { id: siteId },
      isHomepage: true,
      status: PageStatus.PUBLISHED,
    });
    if (homepagePage) {
      return this.renderPage(homepagePage, siteId);
    }

    const site = await this.sitesService.findOne(siteId);
    const theme = await this.themesService.getTheme(siteId);

    const contentTypes = await this.em.find(ContentType, {
      site: { id: siteId },
    });

    const typeCounts: Array<{ ct: ContentType; count: number }> = [];
    for (const ct of contentTypes) {
      const count = await this.em.count(ContentEntry, {
        site: { id: siteId },
        contentType: { id: ct.id },
        status: ContentStatus.LIVE,
      });
      typeCounts.push({ ct, count });
    }

    let content = '<h1>Content Types</h1>\n';

    if (typeCounts.length === 0) {
      content += '<p>No content types have been created yet.</p>\n';
    } else {
      content += '<ul class="content-type-list">\n';
      for (const { ct, count } of typeCounts) {
        content += `  <li><a href="/s/${this.escapeHtml(siteId)}/${this.escapeHtml(ct.slug)}">${this.escapeHtml(ct.name)}</a> <span class="count">(${count} entries)</span></li>\n`;
      }
      content += '</ul>\n';
    }

    return this.buildDocument(site.name, site.name, theme, content, siteId);
  }

  async renderContentTypesPage(siteId: string): Promise<string> {
    const site = await this.sitesService.findOne(siteId);
    const theme = await this.themesService.getTheme(siteId);

    const contentTypes = await this.em.find(ContentType, {
      site: { id: siteId },
    });

    const typeCounts: Array<{ ct: ContentType; count: number }> = [];
    for (const ct of contentTypes) {
      const count = await this.em.count(ContentEntry, {
        site: { id: siteId },
        contentType: { id: ct.id },
        status: ContentStatus.LIVE,
      });
      typeCounts.push({ ct, count });
    }

    let content = '<h1>Content Types</h1>\n';

    if (typeCounts.length === 0) {
      content += '<p>No content types have been created yet.</p>\n';
    } else {
      content += '<ul class="content-type-list">\n';
      for (const { ct, count } of typeCounts) {
        content += `  <li><a href="/s/${this.escapeHtml(siteId)}/${this.escapeHtml(ct.slug)}">${this.escapeHtml(ct.name)}</a> <span class="count">(${count} entries)</span></li>\n`;
      }
      content += '</ul>\n';
    }

    return this.buildDocument(`Content Types | ${site.name}`, site.name, theme, content, siteId);
  }

  async renderBySlug(siteId: string, slug: string): Promise<string> {
    // Check for a published page first
    const page = await this.em.findOne(Page, {
      site: { id: siteId },
      slug,
      status: PageStatus.PUBLISHED,
    });
    if (page) {
      return this.renderPage(page, siteId);
    }

    // Fall back to content type entry listing
    return this.renderEntryListPage(siteId, slug);
  }

  async renderEntryListPage(siteId: string, contentTypeSlug: string): Promise<string> {
    const site = await this.sitesService.findOne(siteId);
    const theme = await this.themesService.getTheme(siteId);

    const contentType = await this.em.findOne(ContentType, {
      site: { id: siteId },
      slug: contentTypeSlug,
    });
    if (!contentType) {
      throw new NotFoundException(`Content type "${contentTypeSlug}" not found for site ${siteId}`);
    }

    const entries = await this.em.find(
      ContentEntry,
      {
        site: { id: siteId },
        contentType: { id: contentType.id },
        status: ContentStatus.LIVE,
      },
      {
        populate: ['contentType', 'contentType.component'] as never,
        orderBy: { publishedAt: 'DESC' },
      },
    );

    let content = `<h1>${this.escapeHtml(contentType.name)}</h1>\n`;
    content += `<p><a href="/s/${this.escapeHtml(siteId)}">&larr; Back to all content types</a></p>\n`;

    if (entries.length === 0) {
      content += '<p>No published entries in this category.</p>\n';
    } else {
      for (const entry of entries) {
        content += this.renderEntrySummary(entry, siteId);
      }
    }

    return this.buildDocument(
      `${contentType.name} | ${site.name}`,
      site.name,
      theme,
      content,
      siteId,
    );
  }

  async renderEntryDetailPage(
    siteId: string,
    contentTypeSlug: string,
    entrySlug: string,
  ): Promise<string> {
    const site = await this.sitesService.findOne(siteId);
    const theme = await this.themesService.getTheme(siteId);

    const contentType = await this.em.findOne(ContentType, {
      site: { id: siteId },
      slug: contentTypeSlug,
    });
    if (!contentType) {
      throw new NotFoundException(`Content type "${contentTypeSlug}" not found for site ${siteId}`);
    }

    const entry = await this.em.findOne(
      ContentEntry,
      {
        site: { id: siteId },
        contentType: { id: contentType.id },
        slug: entrySlug,
        status: ContentStatus.LIVE,
      },
      { populate: ['contentType', 'contentType.component'] as never },
    );
    if (!entry) {
      throw new NotFoundException(`Entry "${entrySlug}" not found in "${contentTypeSlug}"`);
    }

    let renderedContent: string;
    if (entry.contentType.component) {
      renderedContent = this.renderComponent(entry.contentType.component, entry);
    } else {
      renderedContent = this.renderSemanticFields(entry.body ?? {}, entry.contentType.fieldSchema);
    }

    const metaInfo = entry.publishedAt
      ? `<p class="meta">Published ${entry.publishedAt.toLocaleDateString()}</p>\n`
      : '';

    const backLink = `<p><a href="/s/${this.escapeHtml(siteId)}/${this.escapeHtml(contentTypeSlug)}">&larr; Back to ${this.escapeHtml(contentType.name)}</a></p>\n`;

    const content = `${backLink}\n<article>\n<h1>${this.escapeHtml(entry.title)}</h1>\n${metaInfo}\n${renderedContent}\n</article>\n`;

    return this.buildDocument(`${entry.title} | ${site.name}`, site.name, theme, content, siteId);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async renderPage(page: Page, siteId: string): Promise<string> {
    const site = await this.sitesService.findOne(siteId);
    const theme = await this.themesService.getTheme(siteId);

    const sections = await this.em.find(
      PageSection,
      { page: { id: page.id } },
      {
        populate: ['component'] as never,
        orderBy: { sortOrder: 'ASC' },
      },
    );

    let contentHtml = '';
    if (sections.length === 0) {
      contentHtml = '<p>This page has no sections yet.</p>\n';
    } else {
      for (const section of sections) {
        const rendered = this.renderTemplate(
          section.component.template,
          section.props ?? {},
          section.component.propsSchema,
        );
        contentHtml += `<section data-component="${this.escapeHtml(section.component.slug)}">\n${rendered}\n</section>\n`;
      }
    }

    const pageTitle =
      page.meta && typeof page.meta === 'object' && 'title' in page.meta
        ? String(page.meta.title)
        : page.title;

    return this.buildDocument(pageTitle, site.name, theme, contentHtml, siteId);
  }

  private buildDocument(
    title: string,
    siteName: string,
    theme: SiteTheme | null,
    contentHtml: string,
    siteId: string,
  ): string {
    const styles = this.buildThemeStyles(theme);

    return (
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      `  <title>${this.escapeHtml(title)}</title>\n` +
      `${styles}` +
      '</head>\n' +
      '<body>\n' +
      '  <header>\n' +
      '    <nav>\n' +
      `      <a href="/s/${this.escapeHtml(siteId)}" class="site-title">${this.escapeHtml(siteName)}</a>\n` +
      '    </nav>\n' +
      '  </header>\n' +
      '  <main>\n' +
      `${contentHtml}` +
      '  </main>\n' +
      '</body>\n' +
      '</html>\n'
    );
  }

  private buildThemeStyles(theme: SiteTheme | null): string {
    if (!theme) return '';

    let css = '  <style>\n';

    // Design tokens as CSS custom properties
    if (theme.tokens) {
      css += '    :root {\n';
      for (const [key, value] of Object.entries(theme.tokens)) {
        css += `      ${key}: ${value};\n`;
      }
      css += '    }\n';
    }

    // Raw CSS from the theme
    if (theme.rawCss) {
      css += `\n${theme.rawCss}\n`;
    }

    // Component-scoped CSS
    const components = theme.components.getItems();
    for (const component of components) {
      if (component.css) {
        css += `\n    [data-component="${component.slug}"] {\n${component.css}\n    }\n`;
      }
    }

    css += '  </style>\n';
    return css;
  }

  private renderComponent(component: ThemeComponent, entry: ContentEntry): string {
    const rendered = this.renderTemplate(
      component.template,
      entry.body ?? {},
      component.propsSchema,
    );
    return `<div data-component="${this.escapeHtml(component.slug)}">\n${rendered}\n</div>\n`;
  }

  private renderTemplate(
    template: string,
    body: Record<string, unknown>,
    propsSchema: Record<string, string>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, placeholder: string) => {
      const bodyKey = propsSchema[placeholder] ?? placeholder;
      const raw = String(body[bodyKey] ?? '');
      return this.escapeHtml(raw);
    });
  }

  private renderSemanticFields(
    body: Record<string, unknown>,
    fieldSchema: Record<string, unknown> | null,
  ): string {
    const keys = fieldSchema ? Object.keys(fieldSchema) : Object.keys(body);

    if (keys.length === 0) {
      return '<p>No content to display.</p>\n';
    }

    let html = '';
    for (const key of keys) {
      const value = body[key];
      if (value === undefined || value === null) continue;

      const fieldType: string | undefined =
        fieldSchema?.[key] && typeof fieldSchema[key] === 'object' && fieldSchema[key] !== null
          ? ((fieldSchema[key] as Record<string, unknown>).type as string | undefined)
          : undefined;

      if (typeof value === 'string') {
        // Richtext fields may contain raw HTML — detect by fieldSchema type or key naming convention
        const isRichtext =
          fieldType === 'richtext' ||
          fieldType === 'html' ||
          key.toLowerCase().includes('richtext') ||
          key.toLowerCase().includes('html');

        if (isRichtext) {
          html += `<div class="field field-${this.escapeHtml(key)}">${value}</div>\n`;
        } else if (value.startsWith('http://') || value.startsWith('https://')) {
          html += `<p class="field field-${this.escapeHtml(key)}"><a href="${this.escapeHtml(value)}" target="_blank" rel="noopener">${this.escapeHtml(value)}</a></p>\n`;
        } else {
          html += `<p class="field field-${this.escapeHtml(key)}">${this.escapeHtml(value)}</p>\n`;
        }
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        html += `<p class="field field-${this.escapeHtml(key)}">${this.escapeHtml(String(value))}</p>\n`;
      } else if (Array.isArray(value)) {
        html += `<ul class="field field-${this.escapeHtml(key)}">\n`;
        for (const item of value) {
          html += `  <li>${this.escapeHtml(String(item))}</li>\n`;
        }
        html += '</ul>\n';
      } else if (typeof value === 'object') {
        html += `<section class="field field-${this.escapeHtml(key)}">\n`;
        html += this.renderSemanticFields(value as Record<string, unknown>, null);
        html += '</section>\n';
      }
    }

    return html || '<p>No content to display.</p>\n';
  }

  private renderEntrySummary(entry: ContentEntry, siteId: string): string {
    const title = this.escapeHtml(entry.title);
    const contentTypeName = this.escapeHtml(entry.contentType.name);
    const contentTypeSlug = this.escapeHtml(entry.contentType.slug);
    const entrySlug = this.escapeHtml(entry.slug);
    const date = entry.publishedAt ? entry.publishedAt.toLocaleDateString() : '';

    let html = '<article class="entry-summary">\n';
    html += `  <h2><a href="/s/${this.escapeHtml(siteId)}/${contentTypeSlug}/${entrySlug}">${title}</a></h2>\n`;
    html += `  <p class="meta">${contentTypeName}`;
    if (date) {
      html += ` &mdash; ${date}`;
    }
    html += '</p>\n';

    // Extract a text excerpt from the body
    const excerpt = this.extractExcerpt(entry.body);
    if (excerpt) {
      html += `  <p class="excerpt">${this.escapeHtml(excerpt)}</p>\n`;
    }

    html += '</article>\n';
    return html;
  }

  private extractExcerpt(body: Record<string, unknown> | null): string {
    if (!body) return '';

    // Walk body values to find the first string that looks like text content
    for (const value of Object.values(body)) {
      if (typeof value === 'string' && value.length > 0) {
        // Strip HTML tags for the excerpt
        const stripped = value.replace(/<[^>]*>/g, '');
        if (stripped.length > 200) {
          return stripped.substring(0, 200) + '…';
        }
        return stripped;
      }
    }

    return '';
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
