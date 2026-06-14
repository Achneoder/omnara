import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ContentTypesController } from './content-types.controller.js';
import { ContentTypesService } from './content-types.service.js';
import { ContentType } from './entities/content-type.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateContentTypeDto } from './dto/create-content-type.dto.js';
import { UpdateContentTypeDto } from './dto/update-content-type.dto.js';

const mockContentTypesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ContentTypesController', () => {
  let controller: ContentTypesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentTypesController],
      providers: [{ provide: ContentTypesService, useValue: mockContentTypesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContentTypesController>(ContentTypesController);
  });

  describe('findAll', () => {
    it('returns content types for the site', async () => {
      const types = [{ id: 'ct-1' }, { id: 'ct-2' }] as ContentType[];
      mockContentTypesService.findAll.mockResolvedValueOnce(types);

      const result = await controller.findAll('site-1');

      expect(mockContentTypesService.findAll).toHaveBeenCalledWith('site-1');
      expect(result).toBe(types);
    });
  });

  describe('findOne', () => {
    it('returns the content type for the given id', async () => {
      const ct = { id: 'ct-1', name: 'Blog Post' } as ContentType;
      mockContentTypesService.findOne.mockResolvedValueOnce(ct);

      const result = await controller.findOne('site-1', 'ct-1');

      expect(mockContentTypesService.findOne).toHaveBeenCalledWith('ct-1', 'site-1');
      expect(result).toBe(ct);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentTypesService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('delegates to service and returns the created content type', async () => {
      const dto: CreateContentTypeDto = { name: 'Blog Post', slug: 'blog-post' };
      const ct = { id: 'ct-1', ...dto } as ContentType;
      mockContentTypesService.create.mockResolvedValueOnce(ct);

      const result = await controller.create('site-1', dto);

      expect(mockContentTypesService.create).toHaveBeenCalledWith('site-1', dto);
      expect(result).toBe(ct);
    });

    it('propagates ConflictException from service', async () => {
      mockContentTypesService.create.mockRejectedValueOnce(new ConflictException());

      await expect(controller.create('site-1', { name: 'Blog', slug: 'blog' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('delegates to service and returns the updated content type', async () => {
      const dto: UpdateContentTypeDto = { name: 'Updated' };
      const ct = { id: 'ct-1', name: 'Updated' } as ContentType;
      mockContentTypesService.update.mockResolvedValueOnce(ct);

      const result = await controller.update('site-1', 'ct-1', dto);

      expect(mockContentTypesService.update).toHaveBeenCalledWith('ct-1', 'site-1', dto);
      expect(result).toBe(ct);
    });

    it('propagates NotFoundException from service', async () => {
      mockContentTypesService.update.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.update('site-1', 'missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('delegates to service', async () => {
      mockContentTypesService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('site-1', 'ct-1');

      expect(mockContentTypesService.remove).toHaveBeenCalledWith('ct-1', 'site-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockContentTypesService.remove.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.remove('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
