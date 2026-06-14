import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SitesController } from './sites.controller.js';
import { SitesService } from './sites.service.js';
import { Site, SitePlatform } from './entities/site.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';

const mockSitesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SitesController', () => {
  let controller: SitesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [{ provide: SitesService, useValue: mockSitesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SitesController>(SitesController);
  });

  describe('findAll', () => {
    it('returns list of sites from service', async () => {
      const sites = [{ id: 'site-1' }, { id: 'site-2' }] as Site[];
      mockSitesService.findAll.mockResolvedValueOnce(sites);

      const result = await controller.findAll();

      expect(mockSitesService.findAll).toHaveBeenCalled();
      expect(result).toBe(sites);
    });
  });

  describe('findOne', () => {
    it('returns the site for the given id', async () => {
      const site = { id: 'site-1', name: 'My Site' } as Site;
      mockSitesService.findOne.mockResolvedValueOnce(site);

      const result = await controller.findOne('site-1');

      expect(mockSitesService.findOne).toHaveBeenCalledWith('site-1');
      expect(result).toBe(site);
    });

    it('propagates NotFoundException from service', async () => {
      mockSitesService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('delegates to service and returns created site', async () => {
      const dto: CreateSiteDto = {
        name: 'New Site',
        url: 'https://new.com',
        platform: SitePlatform.SHOPIFY,
      };
      const site = { id: 'new-id', ...dto } as Site;
      mockSitesService.create.mockResolvedValueOnce(site);

      const result = await controller.create(dto);

      expect(mockSitesService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(site);
    });
  });

  describe('update', () => {
    it('delegates to service and returns updated site', async () => {
      const dto: UpdateSiteDto = { name: 'Updated' };
      const site = { id: 'site-1', name: 'Updated' } as Site;
      mockSitesService.update.mockResolvedValueOnce(site);

      const result = await controller.update('site-1', dto);

      expect(mockSitesService.update).toHaveBeenCalledWith('site-1', dto);
      expect(result).toBe(site);
    });

    it('propagates NotFoundException from service', async () => {
      mockSitesService.update.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('delegates to service', async () => {
      mockSitesService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('site-1');

      expect(mockSitesService.remove).toHaveBeenCalledWith('site-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockSitesService.remove.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
