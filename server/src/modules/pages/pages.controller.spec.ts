import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PageStatus } from './entities/page.entity.js';

const mockPagesService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  addSection: jest.fn(),
  updateSection: jest.fn(),
  removeSection: jest.fn(),
  reorderSections: jest.fn(),
};

describe('PagesController', () => {
  let controller: PagesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesController],
      providers: [{ provide: PagesService, useValue: mockPagesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PagesController>(PagesController);
  });

  describe('POST /sites/:siteId/pages', () => {
    it('creates a page and returns it', async () => {
      const dto = { title: 'About', slug: 'about' };
      const page = { id: 'page-1', ...dto, status: PageStatus.DRAFT };
      mockPagesService.create.mockResolvedValueOnce(page);

      const result = await controller.create('site-1', dto);

      expect(mockPagesService.create).toHaveBeenCalledWith('site-1', dto);
      expect(result).toBe(page);
    });
  });

  describe('GET /sites/:siteId/pages', () => {
    it('returns all pages for a site', async () => {
      const pages = [{ id: 'page-1', title: 'About', slug: 'about' }];
      mockPagesService.findAll.mockResolvedValueOnce(pages);

      const result = await controller.findAll('site-1', {});

      expect(mockPagesService.findAll).toHaveBeenCalledWith('site-1', undefined);
      expect(result).toBe(pages);
    });

    it('passes status filter when provided', async () => {
      mockPagesService.findAll.mockResolvedValueOnce([]);

      await controller.findAll('site-1', { status: PageStatus.PUBLISHED });

      expect(mockPagesService.findAll).toHaveBeenCalledWith('site-1', PageStatus.PUBLISHED);
    });
  });

  describe('GET /sites/:siteId/pages/:id', () => {
    it('returns a single page', async () => {
      const page = { id: 'page-1', title: 'About', slug: 'about' };
      mockPagesService.findOne.mockResolvedValueOnce(page);

      const result = await controller.findOne('site-1', 'page-1');

      expect(mockPagesService.findOne).toHaveBeenCalledWith('site-1', 'page-1');
      expect(result).toBe(page);
    });
  });

  describe('PATCH /sites/:siteId/pages/:id', () => {
    it('updates a page', async () => {
      const page = { id: 'page-1', title: 'Updated', slug: 'about' };
      mockPagesService.update.mockResolvedValueOnce(page);

      const result = await controller.update('site-1', 'page-1', { title: 'Updated' });

      expect(mockPagesService.update).toHaveBeenCalledWith('site-1', 'page-1', {
        title: 'Updated',
      });
      expect(result).toBe(page);
    });
  });

  describe('DELETE /sites/:siteId/pages/:id', () => {
    it('deletes a page', async () => {
      mockPagesService.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove('site-1', 'page-1');

      expect(mockPagesService.remove).toHaveBeenCalledWith('site-1', 'page-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('POST /sites/:siteId/pages/:id/publish', () => {
    it('publishes a page', async () => {
      const page = { id: 'page-1', status: PageStatus.PUBLISHED };
      mockPagesService.publish.mockResolvedValueOnce(page);

      const result = await controller.publish('site-1', 'page-1');

      expect(mockPagesService.publish).toHaveBeenCalledWith('site-1', 'page-1');
      expect(result).toBe(page);
    });
  });

  describe('POST /sites/:siteId/pages/:id/sections', () => {
    it('adds a section to a page', async () => {
      const section = { id: 'sec-1', sortOrder: 0 };
      mockPagesService.addSection.mockResolvedValueOnce(section);

      const result = await controller.addSection('site-1', 'page-1', {
        componentSlug: 'hero',
      });

      expect(mockPagesService.addSection).toHaveBeenCalledWith('site-1', 'page-1', {
        componentSlug: 'hero',
      });
      expect(result).toBe(section);
    });
  });

  describe('PATCH /sites/:siteId/pages/:id/sections/:sectionId', () => {
    it('updates a section', async () => {
      const section = { id: 'sec-1', sortOrder: 2 };
      mockPagesService.updateSection.mockResolvedValueOnce(section);

      const result = await controller.updateSection('site-1', 'page-1', 'sec-1', {
        sortOrder: 2,
      });

      expect(mockPagesService.updateSection).toHaveBeenCalledWith('site-1', 'sec-1', {
        sortOrder: 2,
      });
      expect(result).toBe(section);
    });
  });
});
