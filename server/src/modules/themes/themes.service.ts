import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SiteTheme } from './entities/site-theme.entity.js';
import { ThemeComponent } from './entities/theme-component.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { ImportThemeDto } from './dto/import-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';
import { UpsertComponentDto } from './dto/upsert-component.dto.js';

@Injectable()
export class ThemesService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async getTheme(siteId: string): Promise<SiteTheme | null> {
    return this.em.findOne(
      SiteTheme,
      { site: { id: siteId } },
      { populate: ['components'] as never },
    );
  }

  async importTheme(siteId: string, dto: ImportThemeDto): Promise<SiteTheme> {
    const theme = await this.em.transactional(async (em) => {
      let siteTheme = await em.findOne(SiteTheme, { site: { id: siteId } });

      if (!siteTheme) {
        const site = await em.findOne(Site, { id: siteId });
        if (!site) {
          throw new NotFoundException(`Site ${siteId} not found`);
        }
        siteTheme = new SiteTheme();
        siteTheme.site = site;
        em.persist(siteTheme);
      }

      siteTheme.name = dto.theme.name;
      siteTheme.version = dto.theme.version;
      siteTheme.tokens = dto.theme.tokens;
      siteTheme.rawCss = dto.theme.rawCss != null ? this.sanitizeRawCss(dto.theme.rawCss) : null;

      for (const componentDto of dto.components ?? []) {
        let component = await em.findOne(ThemeComponent, {
          theme: siteTheme,
          slug: componentDto.slug,
        });

        if (!component) {
          component = new ThemeComponent();
          component.theme = siteTheme;
          component.slug = componentDto.slug;
          em.persist(component);
        }

        component.name = componentDto.name;
        component.category = componentDto.category;
        component.template = componentDto.template;
        component.css = componentDto.css ?? null;
        component.propsSchema = componentDto.propsSchema ?? {};
      }

      await em.flush();
      return siteTheme;
    });

    this.activityLogService
      .log({
        action: 'theme.imported',
        entityType: 'SiteTheme',
        entityId: theme.id,
        siteId,
        metadata: {
          version: dto.theme.version,
          componentCount: dto.components?.length ?? 0,
        },
      })
      .catch(() => {
        // Intentionally swallowed — activity log failures must not surface to callers
      });

    // Re-fetch with components populated (transactional em is forked, use service em)
    const populated = await this.em.findOne(
      SiteTheme,
      { id: theme.id },
      { populate: ['components'] as never },
    );
    // populated is guaranteed non-null because we just created/updated it
    return populated!;
  }

  async updateTheme(siteId: string, dto: UpdateThemeDto): Promise<SiteTheme> {
    const theme = await this.em.findOne(
      SiteTheme,
      { site: { id: siteId } },
      { populate: ['components'] as never },
    );
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }

    if (dto.name !== undefined) theme.name = dto.name;
    if (dto.version !== undefined) theme.version = dto.version;
    if (dto.tokens !== undefined) theme.tokens = dto.tokens;
    if (dto.rawCss !== undefined) {
      theme.rawCss = dto.rawCss != null ? this.sanitizeRawCss(dto.rawCss) : null;
    }

    await this.em.flush();
    return theme;
  }

  async deleteTheme(siteId: string): Promise<void> {
    const theme = await this.em.findOne(SiteTheme, { site: { id: siteId } });
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }
    this.em.remove(theme);
    await this.em.flush();
  }

  async listComponents(siteId: string): Promise<ThemeComponent[]> {
    const theme = await this.em.findOne(SiteTheme, { site: { id: siteId } });
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }
    return this.em.find(ThemeComponent, { theme: { id: theme.id } });
  }

  async getComponent(siteId: string, slug: string): Promise<ThemeComponent> {
    const theme = await this.em.findOne(SiteTheme, { site: { id: siteId } });
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }
    const component = await this.em.findOne(ThemeComponent, {
      theme: { id: theme.id },
      slug,
    });
    if (!component) {
      throw new NotFoundException(`Component "${slug}" not found`);
    }
    return component;
  }

  async upsertComponent(
    siteId: string,
    slug: string,
    dto: UpsertComponentDto,
  ): Promise<ThemeComponent> {
    const theme = await this.em.findOne(SiteTheme, { site: { id: siteId } });
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }

    let component = await this.em.findOne(ThemeComponent, {
      theme: { id: theme.id },
      slug,
    });

    if (!component) {
      component = new ThemeComponent();
      component.theme = theme;
      component.slug = slug;
      this.em.persist(component);
    }

    component.name = dto.name;
    component.category = dto.category;
    component.template = dto.template;
    component.css = dto.css ?? null;
    component.propsSchema = dto.propsSchema ?? {};

    await this.em.flush();
    return component;
  }

  async deleteComponent(siteId: string, slug: string): Promise<void> {
    const component = await this.getComponent(siteId, slug);
    this.em.remove(component);
    await this.em.flush();
  }

  async assignComponentToContentType(
    siteId: string,
    contentTypeSlug: string,
    componentSlug: string | null,
  ): Promise<void> {
    const contentType = await this.em.findOne(ContentType, {
      site: { id: siteId },
      slug: contentTypeSlug,
    });
    if (!contentType) {
      throw new NotFoundException(`ContentType "${contentTypeSlug}" not found`);
    }

    if (componentSlug === null) {
      contentType.component = null;
    } else {
      const component = await this.getComponent(siteId, componentSlug);
      contentType.component = component;
    }

    await this.em.flush();
  }

  private sanitizeRawCss(css: string): string {
    // Strip </style> to prevent injection out of style block
    const sanitized = css.replace(/<\/style>/gi, '');
    // Reject expression() — CSS expression evaluation (IE legacy, still a risk)
    if (/expression\s*\(/i.test(sanitized)) {
      throw new BadRequestException('rawCss must not contain expression()');
    }
    // Reject javascript: URLs
    if (/url\s*\(\s*['"]?\s*javascript:/i.test(sanitized)) {
      throw new BadRequestException('rawCss must not contain javascript: URLs');
    }
    return sanitized;
  }
}
