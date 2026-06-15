import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { AssetsModule } from './modules/assets/assets.module.js';
import { ContentTypesModule } from './modules/content-types/content-types.module.js';
import { ContentEntriesModule } from './modules/content-entries/content-entries.module.js';
import { MediaReferencesModule } from './modules/media-references/media-references.module.js';
import { NavigationModule } from './modules/navigation/navigation.module.js';
import { PagesModule } from './modules/pages/pages.module.js';
import { PublicModule } from './modules/public/public.module.js';
import { SiteServeModule } from './modules/site-serve/site-serve.module.js';
import { ThemesModule } from './modules/themes/themes.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ wildcard: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    McpModule,
    SitesModule,
    ApiKeysModule,
    ActivityLogModule,
    AssetsModule,
    ContentTypesModule,
    ContentEntriesModule,
    MediaReferencesModule,
    PublicModule,
    NavigationModule,
    PagesModule,
    SiteServeModule,
    ThemesModule,
    WebhooksModule,
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
