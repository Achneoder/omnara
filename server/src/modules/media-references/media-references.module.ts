import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MediaReference } from './entities/media-reference.entity.js';
import { MediaReferencesService } from './media-references.service.js';
import { MediaReferencesController } from './media-references.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([MediaReference]), AuthModule, ActivityLogModule],
  controllers: [MediaReferencesController],
  providers: [MediaReferencesService],
  exports: [MediaReferencesService],
})
export class MediaReferencesModule {}
