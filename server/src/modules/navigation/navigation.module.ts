import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MenuItem } from './entities/menu-item.entity.js';
import { NavigationService } from './navigation.service.js';
import { NavigationController } from './navigation.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([MenuItem]), AuthModule, ActivityLogModule],
  providers: [NavigationService],
  controllers: [NavigationController],
  exports: [NavigationService],
})
export class NavigationModule {}
