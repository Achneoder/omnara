import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { McpModule } from './modules/mcp/mcp.module.js';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SitesModule } from './modules/sites/sites.module.js';
import { ApiKeysModule } from './modules/api-keys/api-keys.module.js';
import { ActivityLogModule } from './modules/activity-log/activity-log.module.js';
import { ContentTypesModule } from './modules/content-types/content-types.module.js';
import { ContentEntriesModule } from './modules/content-entries/content-entries.module.js';
import { MediaReferencesModule } from './modules/media-references/media-references.module.js';
import { PublicModule } from './modules/public/public.module.js';
import { ThemesModule } from './modules/themes/themes.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    McpModule,
    SitesModule,
    ApiKeysModule,
    ActivityLogModule,
    ContentTypesModule,
    ContentEntriesModule,
    MediaReferencesModule,
    PublicModule,
    ThemesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
