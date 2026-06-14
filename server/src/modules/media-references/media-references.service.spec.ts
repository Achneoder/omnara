import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { MediaReferencesService } from './media-references.service.js';
import { MediaReference } from './entities/media-reference.entity.js';
import { ContentEntry } from '../content-entries/entities/content-entry.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { AttachMediaDto } from './dto/attach-media.dto.js';

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

describe('MediaReferencesService', () => {
  let service: MediaReferencesService;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockActivityLogService.log.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaReferencesService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<MediaReferencesService>(MediaReferencesService);
  });

  describe('findByEntry', () => {
    it('returns media references for a valid entry', async () => {
      const entry = { id: 'e-1' } as ContentEntry;
      const media = [{ id: 'm-1' }] as MediaReference[];
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.find.mockResolvedValueOnce(media);

      const result = await service.findByEntry('e-1', 'site-1');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(ContentEntry, {
        id: 'e-1',
        site: { id: 'site-1' },
      });
      expect(result).toBe(media);
    });

    it('throws NotFoundException when entry does not belong to site', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.findByEntry('e-1', 'wrong-site')).rejects.toThrow(NotFoundException);
    });
  });

  describe('attach', () => {
    it('attaches media to the entry and returns it', async () => {
      const entry = { id: 'e-1' } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: AttachMediaDto = {
        url: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg',
        altText: 'An image',
      };
      const result = await service.attach('e-1', 'site-1', dto);

      expect(result.url).toBe(dto.url);
      expect(result.mimeType).toBe(dto.mimeType);
      expect(result.altText).toBe(dto.altText);
      expect(result.contentEntry).toBe(entry);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when entry does not belong to site', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.attach('e-1', 'wrong-site', {
          url: 'https://example.com/img.jpg',
          mimeType: 'image/jpeg',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('fires activity log after attaching', async () => {
      const entry = { id: 'e-1' } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(entry);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.attach('e-1', 'site-1', {
        url: 'https://example.com/img.jpg',
        mimeType: 'image/jpeg',
      });
      await Promise.resolve();

      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'media.attached', entityType: 'MediaReference' }),
      );
    });
  });

  describe('detach', () => {
    it('removes the media reference', async () => {
      const media = { id: 'm-1', contentEntry: { id: 'e-1' } } as MediaReference;
      const entry = { id: 'e-1' } as ContentEntry;
      mockEntityManager.findOne.mockResolvedValueOnce(media).mockResolvedValueOnce(entry);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.detach('m-1', 'e-1', 'site-1');

      expect(mockEntityManager.remove).toHaveBeenCalledWith(media);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when media reference does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.detach('missing', 'e-1', 'site-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when entry does not belong to site', async () => {
      const media = { id: 'm-1' } as MediaReference;
      mockEntityManager.findOne.mockResolvedValueOnce(media).mockResolvedValueOnce(null);

      await expect(service.detach('m-1', 'e-1', 'wrong-site')).rejects.toThrow(NotFoundException);
    });
  });
});
