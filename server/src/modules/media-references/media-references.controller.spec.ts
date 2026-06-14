import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MediaReferencesController } from './media-references.controller.js';
import { MediaReferencesService } from './media-references.service.js';
import { MediaReference } from './entities/media-reference.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AttachMediaDto } from './dto/attach-media.dto.js';

const mockMediaReferencesService = {
  findByEntry: jest.fn(),
  attach: jest.fn(),
  detach: jest.fn(),
};

describe('MediaReferencesController', () => {
  let controller: MediaReferencesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaReferencesController],
      providers: [{ provide: MediaReferencesService, useValue: mockMediaReferencesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MediaReferencesController>(MediaReferencesController);
  });

  describe('findByEntry', () => {
    it('returns media references for the entry', async () => {
      const media = [{ id: 'm-1' }] as MediaReference[];
      mockMediaReferencesService.findByEntry.mockResolvedValueOnce(media);

      const result = await controller.findByEntry('site-1', 'e-1');

      expect(mockMediaReferencesService.findByEntry).toHaveBeenCalledWith('e-1', 'site-1');
      expect(result).toBe(media);
    });

    it('propagates NotFoundException from service', async () => {
      mockMediaReferencesService.findByEntry.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findByEntry('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('attach', () => {
    it('attaches media and returns it', async () => {
      const dto: AttachMediaDto = {
        url: 'https://example.com/img.jpg',
        mimeType: 'image/jpeg',
      };
      const media = { id: 'm-1', ...dto } as unknown as MediaReference;
      mockMediaReferencesService.attach.mockResolvedValueOnce(media);

      const result = await controller.attach('site-1', 'e-1', dto);

      expect(mockMediaReferencesService.attach).toHaveBeenCalledWith('e-1', 'site-1', dto);
      expect(result).toBe(media);
    });

    it('propagates NotFoundException from service', async () => {
      mockMediaReferencesService.attach.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.attach('site-1', 'missing', {
          url: 'https://example.com/img.jpg',
          mimeType: 'image/jpeg',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('detach', () => {
    it('delegates to service', async () => {
      mockMediaReferencesService.detach.mockResolvedValueOnce(undefined);

      await controller.detach('site-1', 'e-1', 'm-1');

      expect(mockMediaReferencesService.detach).toHaveBeenCalledWith('m-1', 'e-1', 'site-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockMediaReferencesService.detach.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.detach('site-1', 'e-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
