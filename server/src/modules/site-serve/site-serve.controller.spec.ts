import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SiteServeController } from './site-serve.controller.js';
import { SiteServeService } from './site-serve.service.js';

const mockSiteServeService = {
  renderHomePage: jest.fn(),
  renderContentTypesPage: jest.fn(),
  renderEntryListPage: jest.fn(),
  renderEntryDetailPage: jest.fn(),
};

describe('SiteServeController', () => {
  let controller: SiteServeController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteServeController],
      providers: [{ provide: SiteServeService, useValue: mockSiteServeService }],
    }).compile();

    controller = module.get<SiteServeController>(SiteServeController);
  });

  describe('GET /s/:siteId', () => {
    it('delegates to renderHomePage with the siteId', async () => {
      mockSiteServeService.renderHomePage.mockResolvedValueOnce('<html>home</html>');

      const result = await controller.home('site-1');

      expect(mockSiteServeService.renderHomePage).toHaveBeenCalledWith('site-1');
      expect(result).toBe('<html>home</html>');
    });

    it('propagates NotFoundException when site does not exist', async () => {
      mockSiteServeService.renderHomePage.mockRejectedValueOnce(
        new NotFoundException('Site site-1 not found'),
      );

      await expect(controller.home('site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /s/:siteId/content-types', () => {
    it('delegates to renderContentTypesPage with the siteId', async () => {
      mockSiteServeService.renderContentTypesPage.mockResolvedValueOnce(
        '<html>content types</html>',
      );

      const result = await controller.contentTypes('site-1');

      expect(mockSiteServeService.renderContentTypesPage).toHaveBeenCalledWith('site-1');
      expect(result).toBe('<html>content types</html>');
    });

    it('propagates NotFoundException when site does not exist', async () => {
      mockSiteServeService.renderContentTypesPage.mockRejectedValueOnce(
        new NotFoundException('Site site-1 not found'),
      );

      await expect(controller.contentTypes('site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /s/:siteId/:contentTypeSlug', () => {
    it('delegates to renderEntryListPage with siteId and contentTypeSlug', async () => {
      mockSiteServeService.renderEntryListPage.mockResolvedValueOnce('<html>entries</html>');

      const result = await controller.entryList('site-1', 'blog');

      expect(mockSiteServeService.renderEntryListPage).toHaveBeenCalledWith('site-1', 'blog');
      expect(result).toBe('<html>entries</html>');
    });

    it('propagates NotFoundException when content type does not exist', async () => {
      mockSiteServeService.renderEntryListPage.mockRejectedValueOnce(
        new NotFoundException('Content type "blog" not found for site site-1'),
      );

      await expect(controller.entryList('site-1', 'blog')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /s/:siteId/:contentTypeSlug/:entrySlug', () => {
    it('delegates to renderEntryDetailPage with all params', async () => {
      mockSiteServeService.renderEntryDetailPage.mockResolvedValueOnce('<html>entry detail</html>');

      const result = await controller.entryDetail('site-1', 'blog', 'hello-world');

      expect(mockSiteServeService.renderEntryDetailPage).toHaveBeenCalledWith(
        'site-1',
        'blog',
        'hello-world',
      );
      expect(result).toBe('<html>entry detail</html>');
    });

    it('propagates NotFoundException when entry does not exist', async () => {
      mockSiteServeService.renderEntryDetailPage.mockRejectedValueOnce(
        new NotFoundException('Entry "hello-world" not found in "blog"'),
      );

      await expect(controller.entryDetail('site-1', 'blog', 'hello-world')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
