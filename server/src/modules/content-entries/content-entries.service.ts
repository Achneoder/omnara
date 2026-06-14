import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentEntry, ContentStatus } from './entities/content-entry.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreateContentEntryDto } from './dto/create-content-entry.dto.js';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto.js';
import { ListEntriesDto } from './dto/list-entries.dto.js';

@Injectable()
export class ContentEntriesService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async findAll(siteId: string, filters: ListEntriesDto): Promise<ContentEntry[]> {
    const where: Record<string, unknown> = { site: { id: siteId } };

    if (filters.contentTypeId !== undefined) {
      where['contentType'] = { id: filters.contentTypeId };
    }
    if (filters.status !== undefined) {
      where['status'] = filters.status;
    }
    if (filters.createdAfter !== undefined || filters.createdBefore !== undefined) {
      const range: { $gte?: Date; $lte?: Date } = {};
      if (filters.createdAfter !== undefined) {
        range.$gte = new Date(filters.createdAfter);
      }
      if (filters.createdBefore !== undefined) {
        range.$lte = new Date(filters.createdBefore);
      }
      where['createdAt'] = range;
    }

    return this.em.find(ContentEntry, where, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, siteId: string): Promise<ContentEntry> {
    const entry = await this.em.findOne(
      ContentEntry,
      { id, site: { id: siteId } },
      { populate: ['contentType'] },
    );
    if (!entry) {
      throw new NotFoundException(`ContentEntry ${id} not found`);
    }
    return entry;
  }

  async create(siteId: string, dto: CreateContentEntryDto): Promise<ContentEntry> {
    const site = await this.em.findOne(Site, { id: siteId });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const contentType = await this.em.findOne(ContentType, {
      id: dto.contentTypeId,
      site: { id: siteId },
    });
    if (!contentType) {
      throw new NotFoundException(`ContentType ${dto.contentTypeId} not found`);
    }

    const entry = new ContentEntry();
    entry.site = site;
    entry.contentType = contentType;
    entry.title = dto.title;
    entry.slug = dto.slug;
    entry.status = dto.status ?? ContentStatus.DRAFT;
    if (dto.body !== undefined) entry.body = dto.body;
    if (dto.authorSessionId !== undefined) entry.authorSessionId = dto.authorSessionId;

    this.em.persist(entry);
    await this.em.flush();

    this.logActivity({
      action: 'content_entry.created',
      entityId: entry.id,
      siteId,
    });

    return entry;
  }

  async update(id: string, siteId: string, dto: UpdateContentEntryDto): Promise<ContentEntry> {
    const entry = await this.findOne(id, siteId);

    if (dto.contentTypeId !== undefined) {
      const contentType = await this.em.findOne(ContentType, {
        id: dto.contentTypeId,
        site: { id: siteId },
      });
      if (!contentType) {
        throw new NotFoundException(`ContentType ${dto.contentTypeId} not found`);
      }
      entry.contentType = contentType;
    }
    if (dto.title !== undefined) entry.title = dto.title;
    if (dto.slug !== undefined) entry.slug = dto.slug;
    if (dto.body !== undefined) entry.body = dto.body;
    if (dto.status !== undefined) entry.status = dto.status;
    if (dto.authorSessionId !== undefined) entry.authorSessionId = dto.authorSessionId;

    await this.em.flush();

    this.logActivity({
      action: 'content_entry.updated',
      entityId: entry.id,
      siteId,
    });

    return entry;
  }

  async remove(id: string, siteId: string): Promise<void> {
    const entry = await this.findOne(id, siteId);
    await this.em.removeAndFlush(entry);

    this.logActivity({
      action: 'content_entry.deleted',
      entityId: id,
      siteId,
    });
  }

  async publish(id: string, siteId: string): Promise<ContentEntry> {
    const entry = await this.findOne(id, siteId);
    entry.status = ContentStatus.LIVE;
    entry.publishedAt = new Date();
    await this.em.flush();

    this.logActivity({
      action: 'content_entry.published',
      entityId: entry.id,
      siteId,
    });

    return entry;
  }

  async unpublish(id: string, siteId: string): Promise<ContentEntry> {
    const entry = await this.findOne(id, siteId);
    entry.status = ContentStatus.DRAFT;
    entry.publishedAt = null;
    await this.em.flush();

    this.logActivity({
      action: 'content_entry.unpublished',
      entityId: entry.id,
      siteId,
    });

    return entry;
  }

  // Fire-and-forget: activity logging must not block or fail the main operation
  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'ContentEntry',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {
        // Intentionally swallowed — activity log failures must not surface to callers
      });
  }
}
