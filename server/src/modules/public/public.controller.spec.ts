import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { PublicController } from './public.controller.js';
import { ContentStatus } from '../content-entries/entities/content-entry.entity.js';

const mockEm = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockSite = { id: 'site-1', name: 'Test Site' };

const mockContentType = {
  id: 'ct-1',
  name: 'Ice Cream Flavor',
  slug: 'ice_cream_flavor',
  fieldSchema: { name: { type: 'string' } },
};

const mockEntry = {
  id: 'entry-1',
  title: 'Vanille',
  slug: 'vanille',
  body: { name: 'Vanilla', display_order: 1 },
  status: ContentStatus.LIVE,
  publishedAt: new Date('2026-01-01'),
  contentType: mockContentType,
};

describe('PublicController', () => {
  let controller: PublicController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [{ provide: EntityManager, useValue: mockEm }],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  describe('GET /public/sites/:siteId/entries', () => {
    describe('findEntries', () => {
      it('returns live entries for a valid site', async () => {
        mockEm.findOne.mockResolvedValueOnce(mockSite);
        mockEm.find.mockResolvedValueOnce([mockEntry]);

        const result = await controller.findEntries('site-1', {});

        expect(mockEm.findOne).toHaveBeenCalledWith(expect.anything(), { id: 'site-1' });
        expect(mockEm.find).toHaveBeenCalledWith(
          expect.anything(),
          { site: { id: 'site-1' }, status: ContentStatus.LIVE },
          expect.objectContaining({ populate: ['contentType'] }),
        );
        expect(result).toEqual([
          {
            id: 'entry-1',
            title: 'Vanille',
            slug: 'vanille',
            body: { name: 'Vanilla', display_order: 1 },
            contentType: {
              id: 'ct-1',
              name: 'Ice Cream Flavor',
              slug: 'ice_cream_flavor',
            },
            publishedAt: mockEntry.publishedAt,
          },
        ]);
      });

      it('filters by content type slug when ?type= is provided', async () => {
        mockEm.findOne.mockResolvedValueOnce(mockSite);
        mockEm.find.mockResolvedValueOnce([mockEntry]);

        await controller.findEntries('site-1', { type: 'ice_cream_flavor' });

        expect(mockEm.find).toHaveBeenCalledWith(
          expect.anything(),
          {
            site: { id: 'site-1' },
            status: ContentStatus.LIVE,
            contentType: { slug: 'ice_cream_flavor', site: { id: 'site-1' } },
          },
          expect.objectContaining({ populate: ['contentType'] }),
        );
      });

      it('returns empty array when no live entries exist', async () => {
        mockEm.findOne.mockResolvedValueOnce(mockSite);
        mockEm.find.mockResolvedValueOnce([]);

        const result = await controller.findEntries('site-1', {});

        expect(result).toEqual([]);
      });

      it('throws NotFoundException when site does not exist', async () => {
        mockEm.findOne.mockResolvedValueOnce(null);

        await expect(controller.findEntries('nonexistent-site', {})).rejects.toThrow(
          NotFoundException,
        );
        expect(mockEm.find).not.toHaveBeenCalled();
      });
    });
  });

  describe('GET /public/sites/:siteId/content-types', () => {
    describe('findContentTypes', () => {
      it('returns all content types for a valid site', async () => {
        mockEm.findOne.mockResolvedValueOnce(mockSite);
        mockEm.find.mockResolvedValueOnce([mockContentType]);

        const result = await controller.findContentTypes('site-1');

        expect(mockEm.findOne).toHaveBeenCalledWith(expect.anything(), { id: 'site-1' });
        expect(mockEm.find).toHaveBeenCalledWith(expect.anything(), { site: { id: 'site-1' } });
        expect(result).toEqual([
          {
            id: 'ct-1',
            name: 'Ice Cream Flavor',
            slug: 'ice_cream_flavor',
            fieldSchema: { name: { type: 'string' } },
          },
        ]);
      });

      it('returns empty array when site has no content types', async () => {
        mockEm.findOne.mockResolvedValueOnce(mockSite);
        mockEm.find.mockResolvedValueOnce([]);

        const result = await controller.findContentTypes('site-1');

        expect(result).toEqual([]);
      });

      it('throws NotFoundException when site does not exist', async () => {
        mockEm.findOne.mockResolvedValueOnce(null);

        await expect(controller.findContentTypes('nonexistent-site')).rejects.toThrow(
          NotFoundException,
        );
        expect(mockEm.find).not.toHaveBeenCalled();
      });
    });
  });
});
