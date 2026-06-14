import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Page } from './entities/page.entity.js';
import { PageSection } from './entities/page-section.entity.js';
import { PagesService } from './pages.service.js';
import { PagesController } from './pages.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Page, PageSection]), AuthModule, ActivityLogModule],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}
