import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentEntriesService } from './content-entries.service.js';
import { ContentEntry, ContentStatus } from './entities/content-entry.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreateContentEntryDto } from './dto/create-content-entry.dto.js';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto.js';
import { ListEntriesDto } from './dto/list-entries.dto.js';

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  remove: jest.fn(),
};

const mockActivityLogService = {
  log: jest.fn().mockResolvedValue(undefined),
};

describe('ContentEntriesService', () => {
  let service: ContentEntriesService;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockActivityLogService.log.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentEntriesService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<ContentEntriesService>(ContentEntriesService);
  });

  describe('findAll', () => {
    it('returns all entries for a site', async () => {
      const entries = [{ id: 'e-1' }, { id: 'e-2' }] as ContentEntry[];
      mockEntityManager.find.mockResolvedValueOnce(entries);

      const result = await service.findAll('site-1', {});

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ContentEntry,
        { site: { id: 'site-1' } },
        expect.objectContaining({ orderBy: { createdAt: 'DESC' } }),
      );
      expect(result).toBe(entries);
    });

    it('filters by status', async () => {
      const entries = [] as ContentEntry[];
      mockEntityManager.find.mockResolvedValueOnce(entries);

      const filters: ListEntriesDto = { status: ContentStatus.LIVE };
      await service.findAll('site-1', filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ContentEntry,
        expect.objectContaining({ status: ContentStatus.LIVE }),
        expect.anything(),
      );
    });

    it('filters by contentTypeId', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const filters: ListEntriesDto = { contentTypeId: 'ct-1' };
      await service.findAll('site-1', filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ContentEntry,
        expect.objectContaining({ contentType: { id: 'ct-1' } }),
        expect.anything(),
      );
    });

    it('filters by date range', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const filters: ListEntriesDto = {
        createdAfter: '2026-01-01T00:00:00Z',
        createdBefore: '2026-12-31T00:00:00Z',
      };
      await service.findAll('site-1', filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ContentEntry,
        expect.objectContaining({
          createdAt: {
            $gte: new Date('2026-01-01T00:00:00Z'),
            $lte: new Date('2026-12-31T00:00:00Z'),
          },
        }),
        expect.anything(),
      );
    });
  });

  describe('findOne', () => {
    it('returns entry with populated contentType', async () => {
      const entry = { id: 'e-1', title: 'Hello' } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);

      const result = await service.findOne('e-1', 'site-1');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        ContentEntry,
        { id: 'e-1', site: { id: 'site-1' } },
        { populate: ['contentType'] },
      );
      expect(result).toBe(entry);
    });

    it('throws NotFoundException when entry does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates entry with DRAFT status by default', async () => {
      const site = { id: 'site-1' } as Site;
      const ct = { id: 'ct-1' } as ContentType;
      // findOne for Site, then for ContentType
      mockEntityManager.findOne.mockResolvedValueOnce(site).mockResolvedValueOnce(ct);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: CreateContentEntryDto = {
        contentTypeId: 'ct-1',
        title: 'Hello',
        slug: 'hello',
      };
      const result = await service.create('site-1', dto);

      expect(result.status).toBe(ContentStatus.DRAFT);
      expect(result.title).toBe('Hello');
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('respects explicit status from DTO', async () => {
      const site = { id: 'site-1' } as Site;
      const ct = { id: 'ct-1' } as ContentType;
      mockEntityManager.findOne.mockResolvedValueOnce(site).mockResolvedValueOnce(ct);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: CreateContentEntryDto = {
        contentTypeId: 'ct-1',
        title: 'Hello',
        slug: 'hello',
        status: ContentStatus.REVIEW,
      };
      const result = await service.create('site-1', dto);

      expect(result.status).toBe(ContentStatus.REVIEW);
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create('missing', { contentTypeId: 'ct-1', title: 'x', slug: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when content type does not exist', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site).mockResolvedValueOnce(null);

      await expect(
        service.create('site-1', { contentTypeId: 'missing', title: 'x', slug: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the entry', async () => {
      const entry = {
        id: 'e-1',
        title: 'Old',
        slug: 'old',
        status: ContentStatus.DRAFT,
      } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: UpdateContentEntryDto = { title: 'New' };
      const result = await service.update('e-1', 'site-1', dto);

      expect(result.title).toBe('New');
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when entry does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.update('missing', 'site-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes the entry', async () => {
      const entry = { id: 'e-1' } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.remove('e-1', 'site-1');

      expect(mockEntityManager.remove).toHaveBeenCalledWith(entry);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when entry does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('sets status to LIVE and sets publishedAt', async () => {
      const entry = {
        id: 'e-1',
        status: ContentStatus.DRAFT,
        publishedAt: null,
      } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.publish('e-1', 'site-1');

      expect(result.status).toBe(ContentStatus.LIVE);
      expect(result.publishedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundException when entry does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.publish('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });

    it('fires activity log with published action', async () => {
      const entry = {
        id: 'e-1',
        status: ContentStatus.DRAFT,
        publishedAt: null,
      } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.publish('e-1', 'site-1');
      await Promise.resolve();

      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'content_entry.published' }),
      );
    });
  });

  describe('unpublish', () => {
    it('sets status to DRAFT and clears publishedAt', async () => {
      const entry = {
        id: 'e-1',
        status: ContentStatus.LIVE,
        publishedAt: new Date(),
      } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.unpublish('e-1', 'site-1');

      expect(result.status).toBe(ContentStatus.DRAFT);
      expect(result.publishedAt).toBeNull();
    });

    it('throws NotFoundException when entry does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.unpublish('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });

    it('fires activity log with unpublished action', async () => {
      const entry = {
        id: 'e-1',
        status: ContentStatus.LIVE,
        publishedAt: new Date(),
      } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.unpublish('e-1', 'site-1');
      await Promise.resolve();

      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'content_entry.unpublished' }),
      );
    });
  });
});
