import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContentEntriesController } from './content-entries.controller.js';
import { ContentEntriesService } from './content-entries.service.js';
import { ContentEntry, ContentStatus } from './entities/content-entry.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateContentEntryDto } from './dto/create-content-entry.dto.js';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto.js';
import { ListEntriesDto } from './dto/list-entries.dto.js';

const mockContentEntriesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
};

describe('ContentEntriesController', () => {
  let controller: ContentEntriesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentEntriesController],
      providers: [{ provide: ContentEntriesService, useValue: mockContentEntriesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContentEntriesController>(ContentEntriesController);
  });

  describe('findAll', () => {
    it('delegates to service with siteId and filters', async () => {
      const entries = [{ id: 'e-1' }] as ContentEntry[];
      mockContentEntriesService.findAll.mockResolvedValueOnce(entries);

      const filters: ListEntriesDto = { status: ContentStatus.LIVE };
      const result = await controller.findAll('site-1', filters);

      expect(mockContentEntriesService.findAll).toHaveBeenCalledWith('site-1', filters);
      expect(result).toBe(entries);
    });
  });

  describe('findOne', () => {
    it('returns the entry for given ids', async () => {
      const entry = { id: 'e-1' } as ContentEntry;
      mockContentEntriesService.findOne.mockResolvedValueOnce(entry);

      const result = await controller.findOne('site-1', 'e-1');

      expect(mockContentEntriesService.findOne).toHaveBeenCalledWith('e-1', 'site-1');
      expect(result).toBe(entry);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentEntriesService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('delegates to service and returns created entry', async () => {
      const dto: CreateContentEntryDto = {
        contentTypeId: 'ct-1',
        title: 'Hello',
        slug: 'hello',
      };
      const entry = { id: 'e-1', ...dto } as unknown as ContentEntry;
      mockContentEntriesService.create.mockResolvedValueOnce(entry);

      const result = await controller.create('site-1', dto);

      expect(mockContentEntriesService.create).toHaveBeenCalledWith('site-1', dto);
      expect(result).toBe(entry);
    });
  });

  describe('update', () => {
    it('delegates to service and returns updated entry', async () => {
      const dto: UpdateContentEntryDto = { title: 'Updated' };
      const entry = { id: 'e-1', title: 'Updated' } as ContentEntry;
      mockContentEntriesService.update.mockResolvedValueOnce(entry);

      const result = await controller.update('site-1', 'e-1', dto);

      expect(mockContentEntriesService.update).toHaveBeenCalledWith('e-1', 'site-1', dto);
      expect(result).toBe(entry);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentEntriesService.update.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.update('site-1', 'missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('delegates to service', async () => {
      mockContentEntriesService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('site-1', 'e-1');

      expect(mockContentEntriesService.remove).toHaveBeenCalledWith('e-1', 'site-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockContentEntriesService.remove.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.remove('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('calls publish on service and returns the entry', async () => {
      const entry = { id: 'e-1', status: ContentStatus.LIVE } as ContentEntry;
      mockContentEntriesService.publish.mockResolvedValueOnce(entry);

      const result = await controller.publish('site-1', 'e-1');

      expect(mockContentEntriesService.publish).toHaveBeenCalledWith('e-1', 'site-1');
      expect(result).toBe(entry);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentEntriesService.publish.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.publish('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unpublish', () => {
    it('calls unpublish on service and returns the entry', async () => {
      const entry = { id: 'e-1', status: ContentStatus.DRAFT } as ContentEntry;
      mockContentEntriesService.unpublish.mockResolvedValueOnce(entry);

      const result = await controller.unpublish('site-1', 'e-1');

      expect(mockContentEntriesService.unpublish).toHaveBeenCalledWith('e-1', 'site-1');
      expect(result).toBe(entry);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentEntriesService.unpublish.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.unpublish('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
