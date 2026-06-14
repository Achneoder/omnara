import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SitesService } from './sites.service.js';
import { Site, SitePlatform } from './entities/site.entity.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  remove: jest.fn(),
};

describe('SitesService', () => {
  let service: SitesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SitesService, { provide: EntityManager, useValue: mockEntityManager }],
    }).compile();

    service = module.get<SitesService>(SitesService);
  });

  describe('findAll', () => {
    it('returns all sites', async () => {
      const sites = [{ id: 'site-1' }, { id: 'site-2' }] as Site[];
      mockEntityManager.find.mockResolvedValueOnce(sites);

      const result = await service.findAll();

      expect(mockEntityManager.find).toHaveBeenCalledWith(Site, {});
      expect(result).toBe(sites);
    });
  });

  describe('findOne', () => {
    it('returns site when found', async () => {
      const site = { id: 'site-1', name: 'My Site' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);

      const result = await service.findOne('site-1');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Site, { id: 'site-1' });
      expect(result).toBe(site);
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('persists and flushes a new site, returns it', async () => {
      const dto: CreateSiteDto = {
        name: 'Test Site',
        url: 'https://example.com',
        platform: SitePlatform.WORDPRESS,
        settings: { key: 'value' },
      };
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.create(dto);

      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
      expect(result.url).toBe(dto.url);
      expect(result.platform).toBe(dto.platform);
      expect(result.settings).toEqual(dto.settings);
    });

    it('creates a site without optional settings', async () => {
      const dto: CreateSiteDto = {
        name: 'Minimal Site',
        url: 'https://minimal.com',
        platform: SitePlatform.CUSTOM,
      };
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.create(dto);

      expect(result.name).toBe('Minimal Site');
    });
  });

  describe('update', () => {
    it('updates site fields and flushes', async () => {
      const site = {
        id: 'site-1',
        name: 'Old Name',
        url: 'https://old.com',
        platform: SitePlatform.CUSTOM,
        settings: null,
      } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: UpdateSiteDto = { name: 'New Name' };
      const result = await service.update('site-1', dto);

      expect(result.name).toBe('New Name');
      expect(result.url).toBe('https://old.com');
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes the site and flushes', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.remove('site-1');

      expect(mockEntityManager.remove).toHaveBeenCalledWith(site);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
