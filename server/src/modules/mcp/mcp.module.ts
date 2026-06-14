import { Module } from '@nestjs/common';
import { McpService } from './mcp.service.js';
import { McpController } from './mcp.controller.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { SitesModule } from '../sites/sites.module.js';
import { ContentTypesModule } from '../content-types/content-types.module.js';
import { ContentEntriesModule } from '../content-entries/content-entries.module.js';
import { MediaReferencesModule } from '../media-references/media-references.module.js';
import { ApiKeysModule } from '../api-keys/api-keys.module.js';

@Module({
  imports: [
    SitesModule,
    ContentTypesModule,
    ContentEntriesModule,
    MediaReferencesModule,
    ApiKeysModule,
  ],
  providers: [McpService, ApiKeyGuard],
  controllers: [McpController],
  exports: [McpService],
})
export class McpModule {}
