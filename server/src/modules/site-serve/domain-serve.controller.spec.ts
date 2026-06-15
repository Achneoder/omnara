import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { DomainServeController } from './domain-serve.controller.js';
import { SiteServeService } from './site-serve.service.js';

const mockSiteServeService = {
  renderHomePage: jest.fn(),
  renderContentTypesPage: jest.fn(),
  renderBySlug: jest.fn(),
  renderEntryDetailPage: jest.fn(),
};

type DomainRequest = Request & { domainSiteId?: string };

function makeReq(domainSiteId?: string): DomainRequest {
  return { domainSiteId } as unknown as DomainRequest;
}

describe('DomainServeController', () => {
  let controller: DomainServeController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainServeController],
      providers: [{ provide: SiteServeService, useValue: mockSiteServeService }],
    }).compile();

    controller = module.get<DomainServeController>(DomainServeController);
  });

  describe('GET / (home)', () => {
    it('delegates to renderHomePage with resolved siteId', async () => {
      mockSiteServeService.renderHomePage.mockResolvedValueOnce('<html>home</html>');

      const result = await controller.home(makeReq('site-1'));

      expect(mockSiteServeService.renderHomePage).toHaveBeenCalledWith('site-1');
      expect(result).toBe('<html>home</html>');
    });

    it('throws NotFoundException when domainSiteId is not set', async () => {
      await expect(controller.home(makeReq())).rejects.toThrow(NotFoundException);
      expect(mockSiteServeService.renderHomePage).not.toHaveBeenCalled();
    });
  });

  describe('GET /content-types', () => {
    it('delegates to renderContentTypesPage with resolved siteId', async () => {
      mockSiteServeService.renderContentTypesPage.mockResolvedValueOnce('<html>types</html>');

      const result = await controller.contentTypes(makeReq('site-1'));

      expect(mockSiteServeService.renderContentTypesPage).toHaveBeenCalledWith('site-1');
      expect(result).toBe('<html>types</html>');
    });

    it('throws NotFoundException when domainSiteId is not set', async () => {
      await expect(controller.contentTypes(makeReq())).rejects.toThrow(NotFoundException);
      expect(mockSiteServeService.renderContentTypesPage).not.toHaveBeenCalled();
    });
  });

  describe('GET /:slug', () => {
    it('delegates to renderBySlug with siteId and slug', async () => {
      mockSiteServeService.renderBySlug.mockResolvedValueOnce('<html>slug</html>');

      const result = await controller.slugHandler(makeReq('site-1'), 'blog');

      expect(mockSiteServeService.renderBySlug).toHaveBeenCalledWith('site-1', 'blog');
      expect(result).toBe('<html>slug</html>');
    });

    it('throws NotFoundException when domainSiteId is not set', async () => {
      await expect(controller.slugHandler(makeReq(), 'blog')).rejects.toThrow(NotFoundException);
      expect(mockSiteServeService.renderBySlug).not.toHaveBeenCalled();
    });
  });

  describe('GET /:contentTypeSlug/:entrySlug', () => {
    it('delegates to renderEntryDetailPage with all params', async () => {
      mockSiteServeService.renderEntryDetailPage.mockResolvedValueOnce('<html>entry</html>');

      const result = await controller.entryDetail(makeReq('site-1'), 'blog', 'hello-world');

      expect(mockSiteServeService.renderEntryDetailPage).toHaveBeenCalledWith(
        'site-1',
        'blog',
        'hello-world',
      );
      expect(result).toBe('<html>entry</html>');
    });

    it('throws NotFoundException when domainSiteId is not set', async () => {
      await expect(controller.entryDetail(makeReq(), 'blog', 'hello-world')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSiteServeService.renderEntryDetailPage).not.toHaveBeenCalled();
    });
  });
});
