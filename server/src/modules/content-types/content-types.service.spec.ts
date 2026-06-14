import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentTypesService } from './content-types.service.js';
import { ContentType } from './entities/content-type.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { CreateContentTypeDto } from './dto/create-content-type.dto.js';
import { UpdateContentTypeDto } from './dto/update-content-type.dto.js';

// Simulate a unique constraint violation as thrown by the real driver.
// We cannot import the real class because @mikro-orm/core is mocked via the
// Jest moduleNameMapper. The service detects the exception by the Error `name`
// property, so we set it explicitly to match what the real class exposes.
class UniqueConstraintViolationException extends Error {
  constructor() {
    super('unique constraint violation');
    this.name = 'UniqueConstraintViolationException';
  }
}

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  removeAndFlush: jest.fn(),
};

const mockActivityLogService = {
  log: jest.fn().mockResolvedValue(undefined),
};

describe('ContentTypesService', () => {
  let service: ContentTypesService;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockActivityLogService.log.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentTypesService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<ContentTypesService>(ContentTypesService);
  });

  describe('findAll', () => {
    it('returns all content types for a site', async () => {
      const types = [{ id: 'ct-1' }, { id: 'ct-2' }] as ContentType[];
      mockEntityManager.find.mockResolvedValueOnce(types);

      const result = await service.findAll('site-1');

      expect(mockEntityManager.find).toHaveBeenCalledWith(ContentType, {
        site: { id: 'site-1' },
      });
      expect(result).toBe(types);
    });
  });

  describe('findOne', () => {
    it('returns content type when found in site', async () => {
      const ct = { id: 'ct-1', name: 'Blog Post' } as ContentType;
      mockEntityManager.findOne.mockResolvedValueOnce(ct);

      const result = await service.findOne('ct-1', 'site-1');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(ContentType, {
        id: 'ct-1',
        site: { id: 'site-1' },
      });
      expect(result).toBe(ct);
    });

    it('throws NotFoundException when content type does not exist or belongs to different site', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and returns a new content type', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: CreateContentTypeDto = { name: 'Blog Post', slug: 'blog-post' };
      const result = await service.create('site-1', dto);

      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
      expect(result.name).toBe('Blog Post');
      expect(result.slug).toBe('blog-post');
      expect(result.site).toBe(site);
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.create('missing-site', { name: 'Blog', slug: 'blog' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException on unique constraint violation', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockRejectedValueOnce(new UniqueConstraintViolationException());

      await expect(service.create('site-1', { name: 'Blog', slug: 'blog' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('fires activity log after creation', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.create('site-1', { name: 'Blog', slug: 'blog' });

      // Allow the microtask queue to drain
      await Promise.resolve();
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'content_type.created', entityType: 'ContentType' }),
      );
    });
  });

  describe('update', () => {
    it('updates and returns the content type', async () => {
      const ct = { id: 'ct-1', name: 'Old', slug: 'old' } as ContentType;
      mockEntityManager.findOne.mockResolvedValueOnce(ct);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: UpdateContentTypeDto = { name: 'New' };
      const result = await service.update('ct-1', 'site-1', dto);

      expect(result.name).toBe('New');
      expect(result.slug).toBe('old');
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when content type does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.update('missing', 'site-1', {})).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException on unique constraint violation during update', async () => {
      const ct = { id: 'ct-1', name: 'Old', slug: 'old' } as ContentType;
      mockEntityManager.findOne.mockResolvedValueOnce(ct);
      mockEntityManager.flush.mockRejectedValueOnce(new UniqueConstraintViolationException());

      await expect(service.update('ct-1', 'site-1', { slug: 'existing' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('removes the content type', async () => {
      const ct = { id: 'ct-1' } as ContentType;
      mockEntityManager.findOne.mockResolvedValueOnce(ct);
      mockEntityManager.removeAndFlush.mockResolvedValueOnce(undefined);

      await service.remove('ct-1', 'site-1');

      expect(mockEntityManager.removeAndFlush).toHaveBeenCalledWith(ct);
    });

    it('throws NotFoundException when content type does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });
  });
});
