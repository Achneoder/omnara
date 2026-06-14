import { Module } from '@nestjs/common';
import { SiteServeController } from './site-serve.controller.js';
import { SiteServeService } from './site-serve.service.js';
import { ThemesModule } from '../themes/themes.module.js';
import { SitesModule } from '../sites/sites.module.js';
import { ContentTypesModule } from '../content-types/content-types.module.js';
import { ContentEntriesModule } from '../content-entries/content-entries.module.js';
import { PagesModule } from '../pages/pages.module.js';

@Module({
  imports: [ThemesModule, SitesModule, ContentTypesModule, ContentEntriesModule, PagesModule],
  controllers: [SiteServeController],
  providers: [SiteServeService],
})
export class SiteServeModule {}
