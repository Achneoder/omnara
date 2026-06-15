import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { MenuItem } from './entities/menu-item.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';

@Injectable()
export class NavigationService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(siteId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = new MenuItem();
    item.site = this.em.getReference(Site, siteId);
    item.label = dto.label;
    item.url = dto.url;
    if (dto.parentId !== undefined) {
      item.parent = this.em.getReference(MenuItem, dto.parentId);
    }
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;
    if (dto.menuName !== undefined) item.menuName = dto.menuName;

    this.em.persist(item);
    await this.em.flush();

    this.logActivity({ action: 'menu_item.created', entityId: item.id, siteId });
    return item;
  }

  async findAll(siteId: string, menuName?: string): Promise<MenuItem[]> {
    const where: Record<string, unknown> = { site: { id: siteId } };
    if (menuName !== undefined) {
      where['menuName'] = menuName;
    }
    return this.em.find(MenuItem, where, {
      orderBy: { menuName: 'ASC', sortOrder: 'ASC' },
    });
  }

  async update(siteId: string, itemId: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOrFail(siteId, itemId);

    if (dto.label !== undefined) item.label = dto.label;
    if (dto.url !== undefined) item.url = dto.url;
    if (dto.parentId !== undefined) {
      item.parent = dto.parentId ? this.em.getReference(MenuItem, dto.parentId) : null;
    }
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;
    if (dto.menuName !== undefined) item.menuName = dto.menuName;

    await this.em.flush();

    this.logActivity({ action: 'menu_item.updated', entityId: item.id, siteId });
    return item;
  }

  async remove(siteId: string, itemId: string): Promise<void> {
    const item = await this.findOrFail(siteId, itemId);
    this.em.remove(item);
    await this.em.flush();

    this.logActivity({ action: 'menu_item.deleted', entityId: itemId, siteId });
  }

  async reorder(siteId: string, itemIds: string[]): Promise<MenuItem[]> {
    const items = await this.em.find(MenuItem, {
      id: { $in: itemIds },
      site: { id: siteId },
    });

    if (items.length !== itemIds.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    const orderMap = new Map(itemIds.map((id, idx) => [id, idx]));
    for (const item of items) {
      item.sortOrder = orderMap.get(item.id) ?? 0;
    }

    await this.em.flush();
    return items;
  }

  private async findOrFail(siteId: string, itemId: string): Promise<MenuItem> {
    const item = await this.em.findOne(MenuItem, {
      id: itemId,
      site: { id: siteId },
    });
    if (!item) {
      throw new NotFoundException(`MenuItem ${itemId} not found`);
    }
    return item;
  }

  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'MenuItem',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {});
  }
}
