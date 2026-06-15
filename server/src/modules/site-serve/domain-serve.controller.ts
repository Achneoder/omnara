import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { SiteServeService } from './site-serve.service.js';

type DomainRequest = Request & { domainSiteId?: string };

function resolveSiteId(req: DomainRequest): string {
  const siteId = req.domainSiteId;
  if (!siteId) {
    throw new NotFoundException('No site is mapped to this domain');
  }
  return siteId;
}

@Controller()
export class DomainServeController {
  constructor(private readonly siteServeService: SiteServeService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async home(@Req() req: DomainRequest): Promise<string> {
    return this.siteServeService.renderHomePage(resolveSiteId(req));
  }

  @Get('content-types')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async contentTypes(@Req() req: DomainRequest): Promise<string> {
    return this.siteServeService.renderContentTypesPage(resolveSiteId(req));
  }

  @Get(':contentTypeSlug/:entrySlug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async entryDetail(
    @Req() req: DomainRequest,
    @Param('contentTypeSlug') contentTypeSlug: string,
    @Param('entrySlug') entrySlug: string,
  ): Promise<string> {
    return this.siteServeService.renderEntryDetailPage(
      resolveSiteId(req),
      contentTypeSlug,
      entrySlug,
    );
  }

  @Get(':slug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async slugHandler(@Req() req: DomainRequest, @Param('slug') slug: string): Promise<string> {
    return this.siteServeService.renderBySlug(resolveSiteId(req), slug);
  }
}
