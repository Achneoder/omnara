import { Controller, Get, Param, Query, NotFoundException, Req, Res } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentEntry, ContentStatus } from '../content-entries/entities/content-entry.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ThemesService } from '../themes/themes.service.js';

class PublicListEntriesQuery {
  @IsOptional()
  @IsString()
  type?: string;
}

interface PublicContentTypeResponse {
  id: string;
  name: string;
  slug: string;
  fieldSchema: Record<string, unknown> | null;
}

interface ComponentSummary {
  slug: string;
  template: string;
  css: string | null;
  propsSchema: Record<string, string>;
}

interface PublicEntryResponse {
  id: string;
  title: string;
  slug: string;
  body: Record<string, unknown> | null;
  contentType: {
    id: string;
    name: string;
    slug: string;
    component: ComponentSummary | null;
  };
  publishedAt: Date | null;
}

@Controller('public/sites/:siteId')
export class PublicController {
  constructor(
    private readonly em: EntityManager,
    private readonly themesService: ThemesService,
  ) {}

  @Get('entries')
  async findEntries(
    @Param('siteId') siteId: string,
    @Query() query: PublicListEntriesQuery,
  ): Promise<PublicEntryResponse[]> {
    const siteExists = await this.em.findOne(Site, { id: siteId });
    if (!siteExists) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const where: Record<string, unknown> = {
      site: { id: siteId },
      status: ContentStatus.LIVE,
    };

    if (query.type !== undefined) {
      where['contentType'] = { slug: query.type, site: { id: siteId } };
    }

    const entries = await this.em.find(ContentEntry, where, {
      populate: ['contentType', 'contentType.component'] as never,
      orderBy: { publishedAt: 'DESC' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      body: entry.body,
      contentType: {
        id: entry.contentType.id,
        name: entry.contentType.name,
        slug: entry.contentType.slug,
        component: entry.contentType.component
          ? {
              slug: entry.contentType.component.slug,
              template: entry.contentType.component.template,
              css: entry.contentType.component.css,
              propsSchema: entry.contentType.component.propsSchema,
            }
          : null,
      },
      publishedAt: entry.publishedAt,
    }));
  }

  @Get('content-types')
  async findContentTypes(@Param('siteId') siteId: string): Promise<PublicContentTypeResponse[]> {
    const siteExists = await this.em.findOne(Site, { id: siteId });
    if (!siteExists) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const contentTypes = await this.em.find(ContentType, { site: { id: siteId } });

    return contentTypes.map((ct) => ({
      id: ct.id,
      name: ct.name,
      slug: ct.slug,
      fieldSchema: ct.fieldSchema,
    }));
  }

  @Get('theme')
  async getTheme(
    @Param('siteId') siteId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const theme = await this.themesService.getTheme(siteId);

    if (!theme) {
      res.status(404).json({ message: `Theme for site ${siteId} not found` });
      return;
    }

    const etag = `"${createHash('md5')
      .update(theme.version + theme.updatedAt.toISOString())
      .digest('hex')}"`;

    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', theme.updatedAt.toUTCString());
    res.setHeader('Cache-Control', 'public, max-age=30');

    const components = theme.components.getItems().map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      category: c.category,
      template: c.template,
      css: c.css,
      propsSchema: c.propsSchema,
    }));

    res.json({
      id: theme.id,
      name: theme.name,
      version: theme.version,
      tokens: theme.tokens,
      rawCss: theme.rawCss,
      components,
      updatedAt: theme.updatedAt,
    });
  }
}
