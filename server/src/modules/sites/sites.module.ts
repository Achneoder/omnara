import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Site } from './entities/site.entity.js';
import { SitesService } from './sites.service.js';
import { SitesController } from './sites.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Site]), AuthModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
