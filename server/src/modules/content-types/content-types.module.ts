import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContentType } from './entities/content-type.entity.js';
import { ContentTypesService } from './content-types.service.js';
import { ContentTypesController } from './content-types.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([ContentType]), AuthModule, ActivityLogModule],
  controllers: [ContentTypesController],
  providers: [ContentTypesService],
  exports: [ContentTypesService],
})
export class ContentTypesModule {}
