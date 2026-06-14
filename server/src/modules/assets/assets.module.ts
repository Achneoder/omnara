import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Asset } from './entities/asset.entity.js';
import { AssetsService } from './assets.service.js';
import { AssetsController } from './assets.controller.js';
import { LocalAssetStorage } from './storage/local-asset-storage.js';
import { AuthModule } from '../auth/auth.module.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Asset]), AuthModule, ActivityLogModule],
  controllers: [AssetsController],
  providers: [AssetsService, { provide: 'AssetStorage', useClass: LocalAssetStorage }],
  exports: [AssetsService],
})
export class AssetsModule {}
