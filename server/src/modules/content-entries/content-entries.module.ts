import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContentEntry } from './entities/content-entry.entity.js';
import { ContentEntriesService } from './content-entries.service.js';
import { ContentEntriesController } from './content-entries.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([ContentEntry]), AuthModule, ActivityLogModule],
  controllers: [ContentEntriesController],
  providers: [ContentEntriesService],
  exports: [ContentEntriesService],
})
export class ContentEntriesModule {}
