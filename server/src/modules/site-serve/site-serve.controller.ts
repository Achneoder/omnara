import { Controller, Get, Header, Param } from '@nestjs/common';
import { SiteServeService } from './site-serve.service.js';

@Controller('s')
export class SiteServeController {
  constructor(private readonly siteServeService: SiteServeService) {}

  @Get(':siteId/content-types')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async contentTypes(@Param('siteId') siteId: string): Promise<string> {
    return this.siteServeService.renderContentTypesPage(siteId);
  }

  @Get(':siteId/:contentTypeSlug/:entrySlug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async entryDetail(
    @Param('siteId') siteId: string,
    @Param('contentTypeSlug') contentTypeSlug: string,
    @Param('entrySlug') entrySlug: string,
  ): Promise<string> {
    return this.siteServeService.renderEntryDetailPage(siteId, contentTypeSlug, entrySlug);
  }

  @Get(':siteId/:contentTypeSlug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async entryList(
    @Param('siteId') siteId: string,
    @Param('contentTypeSlug') contentTypeSlug: string,
  ): Promise<string> {
    return this.siteServeService.renderEntryListPage(siteId, contentTypeSlug);
  }

  @Get(':siteId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async home(@Param('siteId') siteId: string): Promise<string> {
    return this.siteServeService.renderHomePage(siteId);
  }
}
