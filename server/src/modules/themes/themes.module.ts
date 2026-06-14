import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SiteTheme } from './entities/site-theme.entity.js';
import { ThemeComponent } from './entities/theme-component.entity.js';
import { ThemesService } from './themes.service.js';
import { ThemesController } from './themes.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';
import { AssetsModule } from '../assets/assets.module.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([SiteTheme, ThemeComponent]),
    AuthModule,
    ActivityLogModule,
    AssetsModule,
  ],
  providers: [ThemesService],
  controllers: [ThemesController],
  exports: [ThemesService],
})
export class ThemesModule {}
