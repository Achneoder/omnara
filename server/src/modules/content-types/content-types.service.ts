import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentType } from './entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreateContentTypeDto } from './dto/create-content-type.dto.js';
import { UpdateContentTypeDto } from './dto/update-content-type.dto.js';

// MikroORM's UniqueConstraintViolationException is detected by constructor
// name rather than instanceof so that the mock moduleNameMapper used in Jest
// does not break this check — the class name is preserved even when the module
// is replaced by a stub.
function isUniqueConstraintViolation(err: unknown): boolean {
  // Check by the Error `name` property rather than instanceof so this works
  // both with the real MikroORM class (which sets name = 'UniqueConstraintViolationException')
  // and in the Jest environment where @mikro-orm/core is replaced by a stub.
  return err instanceof Error && err.name === 'UniqueConstraintViolationException';
}

@Injectable()
export class ContentTypesService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async findAll(siteId: string): Promise<ContentType[]> {
    return this.em.find(ContentType, { site: { id: siteId } });
  }

  async findOne(id: string, siteId: string): Promise<ContentType> {
    const contentType = await this.em.findOne(ContentType, {
      id,
      site: { id: siteId },
    });
    if (!contentType) {
      throw new NotFoundException(`ContentType ${id} not found`);
    }
    return contentType;
  }

  async create(siteId: string, dto: CreateContentTypeDto): Promise<ContentType> {
    const site = await this.em.findOne(Site, { id: siteId });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const contentType = new ContentType();
    contentType.site = site;
    contentType.name = dto.name;
    contentType.slug = dto.slug;
    if (dto.fieldSchema !== undefined) {
      contentType.fieldSchema = dto.fieldSchema;
    }

    this.em.persist(contentType);
    try {
      await this.em.flush();
    } catch (err) {
      if (isUniqueConstraintViolation(err)) {
        throw new ConflictException(
          `A content type with slug "${dto.slug}" already exists for this site`,
        );
      }
      throw err;
    }

    this.logActivity({
      action: 'content_type.created',
      entityId: contentType.id,
      siteId,
    });

    return contentType;
  }

  async update(id: string, siteId: string, dto: UpdateContentTypeDto): Promise<ContentType> {
    const contentType = await this.findOne(id, siteId);

    if (dto.name !== undefined) contentType.name = dto.name;
    if (dto.slug !== undefined) contentType.slug = dto.slug;
    if (dto.fieldSchema !== undefined) contentType.fieldSchema = dto.fieldSchema;

    try {
      await this.em.flush();
    } catch (err) {
      if (isUniqueConstraintViolation(err)) {
        throw new ConflictException(
          `A content type with slug "${dto.slug}" already exists for this site`,
        );
      }
      throw err;
    }

    this.logActivity({
      action: 'content_type.updated',
      entityId: contentType.id,
      siteId,
    });

    return contentType;
  }

  async remove(id: string, siteId: string): Promise<void> {
    const contentType = await this.findOne(id, siteId);
    await this.em.removeAndFlush(contentType);

    this.logActivity({
      action: 'content_type.deleted',
      entityId: id,
      siteId,
    });
  }

  // Fire-and-forget: activity logging must not block or fail the main operation
  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'ContentType',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {
        // Intentionally swallowed — activity log failures must not surface to callers
      });
  }
}
