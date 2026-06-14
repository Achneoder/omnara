import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentEntry, ContentStatus } from '../content-entries/entities/content-entry.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';

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

interface PublicEntryResponse {
  id: string;
  title: string;
  slug: string;
  body: Record<string, unknown> | null;
  contentType: {
    id: string;
    name: string;
    slug: string;
  };
  publishedAt: Date | null;
}

@Controller('public/sites/:siteId')
export class PublicController {
  constructor(private readonly em: EntityManager) {}

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
      populate: ['contentType'],
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
}
