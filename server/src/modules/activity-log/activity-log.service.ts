import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityLog } from './entities/activity-log.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ListActivityDto } from './dto/list-activity.dto.js';

interface LogParams {
  siteId?: string;
  sessionId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly em: EntityManager) {}

  async log(params: LogParams): Promise<void> {
    const entry = new ActivityLog();
    entry.action = params.action;
    entry.entityType = params.entityType;
    if (params.entityId !== undefined) entry.entityId = params.entityId;
    if (params.sessionId !== undefined) entry.sessionId = params.sessionId;
    if (params.metadata !== undefined) entry.metadata = params.metadata;
    if (params.siteId !== undefined) {
      // Use a reference to avoid an extra SELECT — the FK is all we need
      entry.site = this.em.getReference(Site, params.siteId);
    }
    this.em.persist(entry);
    await this.em.flush();
  }

  async findAll(filters: ListActivityDto): Promise<ActivityLog[]> {
    const where: Record<string, unknown> = {};

    if (filters.siteId !== undefined) {
      where['site'] = { id: filters.siteId };
    }
    if (filters.action !== undefined) {
      where['action'] = filters.action;
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

    return this.em.find(ActivityLog, where, {
      orderBy: { createdAt: 'DESC' },
      limit: 100,
    });
  }
}
