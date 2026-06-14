import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { MediaReference } from './entities/media-reference.entity.js';
import { ContentEntry } from '../content-entries/entities/content-entry.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { AttachMediaDto } from './dto/attach-media.dto.js';

@Injectable()
export class MediaReferencesService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async findByEntry(entryId: string, siteId: string): Promise<MediaReference[]> {
    // Verify the entry belongs to the site before returning its media
    const entry = await this.em.findOne(ContentEntry, {
      id: entryId,
      site: { id: siteId },
    });
    if (!entry) {
      throw new NotFoundException(`ContentEntry ${entryId} not found`);
    }
    return this.em.find(MediaReference, { contentEntry: { id: entryId } });
  }

  async attach(entryId: string, siteId: string, dto: AttachMediaDto): Promise<MediaReference> {
    const entry = await this.em.findOne(ContentEntry, {
      id: entryId,
      site: { id: siteId },
    });
    if (!entry) {
      throw new NotFoundException(`ContentEntry ${entryId} not found`);
    }

    const media = new MediaReference();
    media.contentEntry = entry;
    media.url = dto.url;
    media.mimeType = dto.mimeType;
    if (dto.altText !== undefined) media.altText = dto.altText;

    this.em.persist(media);
    await this.em.flush();

    this.logActivity({
      action: 'media.attached',
      entityId: media.id,
      siteId,
    });

    return media;
  }

  async detach(id: string, entryId: string, siteId: string): Promise<void> {
    const media = await this.em.findOne(
      MediaReference,
      { id, contentEntry: { id: entryId } },
      { populate: ['contentEntry'] },
    );
    if (!media) {
      throw new NotFoundException(`MediaReference ${id} not found`);
    }

    // Verify the parent entry belongs to the site
    const entry = await this.em.findOne(ContentEntry, {
      id: entryId,
      site: { id: siteId },
    });
    if (!entry) {
      throw new NotFoundException(`ContentEntry ${entryId} not found`);
    }

    await this.em.removeAndFlush(media);

    this.logActivity({
      action: 'media.detached',
      entityId: id,
      siteId,
    });
  }

  // Fire-and-forget: activity logging must not block or fail the main operation
  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'MediaReference',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {
        // Intentionally swallowed — activity log failures must not surface to callers
      });
  }
}
