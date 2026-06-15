import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/postgresql';
import { Page, PageStatus } from './entities/page.entity.js';
import { PageSection } from './entities/page-section.entity.js';
import { ThemeComponent } from '../themes/entities/theme-component.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { AddSectionDto } from './dto/add-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';

@Injectable()
export class PagesService {
  constructor(
    private readonly em: EntityManager,
    private readonly activityLogService: ActivityLogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(siteId: string, dto: CreatePageDto): Promise<Page> {
    const page = new Page();
    page.site = this.em.getReference(Site, siteId);
    page.title = dto.title;
    page.slug = dto.slug;
    if (dto.isHomepage !== undefined) page.isHomepage = dto.isHomepage;
    if (dto.meta !== undefined) page.meta = dto.meta;
    if (dto.status !== undefined) page.status = dto.status;

    if (page.isHomepage) {
      await this.clearOtherHomepages(siteId);
    }

    this.em.persist(page);
    await this.em.flush();

    this.logActivity({ action: 'page.created', entityId: page.id, siteId });
    return page;
  }

  async findOne(siteId: string, pageId: string): Promise<Page> {
    const page = await this.em.findOne(
      Page,
      { id: pageId, site: { id: siteId } },
      { populate: ['sections', 'sections.component'] as never },
    );
    if (!page) {
      throw new NotFoundException(`Page ${pageId} not found`);
    }
    return page;
  }

  async findAll(siteId: string, status?: PageStatus): Promise<Page[]> {
    const where: Record<string, unknown> = { site: { id: siteId } };
    if (status !== undefined) {
      where['status'] = status;
    }
    return this.em.find(Page, where, {
      orderBy: { sortOrder: 'ASC' },
    });
  }

  async update(siteId: string, pageId: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(siteId, pageId);

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.slug !== undefined) page.slug = dto.slug;
    if (dto.meta !== undefined) page.meta = dto.meta;
    if (dto.status !== undefined) page.status = dto.status;

    if (dto.isHomepage === true && !page.isHomepage) {
      await this.clearOtherHomepages(siteId, pageId);
      page.isHomepage = true;
    } else if (dto.isHomepage !== undefined) {
      page.isHomepage = dto.isHomepage;
    }

    await this.em.flush();

    this.logActivity({ action: 'page.updated', entityId: page.id, siteId });
    return page;
  }

  async remove(siteId: string, pageId: string): Promise<void> {
    const page = await this.findOne(siteId, pageId);
    this.em.remove(page);
    await this.em.flush();

    this.logActivity({ action: 'page.deleted', entityId: pageId, siteId });
  }

  async publish(siteId: string, pageId: string): Promise<Page> {
    const page = await this.findOne(siteId, pageId);
    page.status = PageStatus.PUBLISHED;
    await this.em.flush();

    this.logActivity({ action: 'page.published', entityId: page.id, siteId });
    this.eventEmitter.emit('webhook.page.published', {
      siteId,
      event: 'page.published',
      payload: page,
    });
    return page;
  }

  async unpublish(siteId: string, pageId: string): Promise<Page> {
    const page = await this.findOne(siteId, pageId);
    page.status = PageStatus.DRAFT;
    await this.em.flush();

    this.logActivity({ action: 'page.unpublished', entityId: page.id, siteId });
    return page;
  }

  async addSection(siteId: string, pageId: string, dto: AddSectionDto): Promise<PageSection> {
    const page = await this.findOne(siteId, pageId);

    const component = await this.em.findOne(ThemeComponent, {
      slug: dto.componentSlug,
      theme: { site: { id: siteId } },
    });
    if (!component) {
      throw new NotFoundException(
        `ThemeComponent "${dto.componentSlug}" not found for site ${siteId}`,
      );
    }

    const section = new PageSection();
    section.page = page;
    section.component = component;
    section.props = dto.props ?? {};

    if (dto.sortOrder !== undefined) {
      section.sortOrder = dto.sortOrder;
    } else {
      const existingSections = await this.em.find(
        PageSection,
        { page: { id: page.id } },
        { orderBy: { sortOrder: 'DESC' }, limit: 1 },
      );
      section.sortOrder = existingSections.length > 0 ? existingSections[0].sortOrder + 1 : 0;
    }

    this.em.persist(section);
    await this.em.flush();

    this.logActivity({ action: 'page_section.created', entityId: section.id, siteId });
    return section;
  }

  async updateSection(
    siteId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ): Promise<PageSection> {
    const section = await this.findSectionOrFail(siteId, sectionId);

    if (dto.sortOrder !== undefined) section.sortOrder = dto.sortOrder;
    if (dto.props !== undefined) section.props = dto.props;

    await this.em.flush();
    return section;
  }

  async removeSection(siteId: string, sectionId: string): Promise<void> {
    const section = await this.findSectionOrFail(siteId, sectionId);
    this.em.remove(section);
    await this.em.flush();

    this.logActivity({ action: 'page_section.deleted', entityId: sectionId, siteId });
  }

  async reorderSections(
    siteId: string,
    pageId: string,
    sectionIds: string[],
  ): Promise<PageSection[]> {
    // Ensure the page exists and belongs to the site
    await this.findOne(siteId, pageId);

    const sections = await this.em.find(PageSection, {
      id: { $in: sectionIds },
      page: { id: pageId },
    });

    if (sections.length !== sectionIds.length) {
      throw new NotFoundException('One or more sections not found on the specified page');
    }

    const orderMap = new Map(sectionIds.map((id, idx) => [id, idx]));
    for (const section of sections) {
      section.sortOrder = orderMap.get(section.id) ?? 0;
    }

    await this.em.flush();
    return sections;
  }

  async findBySlug(siteId: string, slug: string): Promise<Page | null> {
    return this.em.findOne(Page, {
      site: { id: siteId },
      slug,
      status: PageStatus.PUBLISHED,
    });
  }

  async findHomepage(siteId: string): Promise<Page | null> {
    return this.em.findOne(Page, {
      site: { id: siteId },
      isHomepage: true,
      status: PageStatus.PUBLISHED,
    });
  }

  private async findSectionOrFail(siteId: string, sectionId: string): Promise<PageSection> {
    const section = await this.em.findOne(
      PageSection,
      { id: sectionId },
      { populate: ['page', 'component'] as never },
    );
    if (!section || section.page.site.id !== siteId) {
      throw new NotFoundException(`Section ${sectionId} not found`);
    }
    return section;
  }

  private async clearOtherHomepages(siteId: string, excludePageId?: string): Promise<void> {
    const where: Record<string, unknown> = {
      site: { id: siteId },
      isHomepage: true,
    };
    if (excludePageId) {
      where['id'] = { $ne: excludePageId };
    }

    const existing = await this.em.find(Page, where);
    for (const page of existing) {
      page.isHomepage = false;
    }
  }

  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'Page',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {
        // Intentionally swallowed — activity log failures must not surface to callers
      });
  }
}
