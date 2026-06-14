import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ApiKey } from './entities/api-key.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { ApiKeysService } from './api-keys.service.js';
import { ApiKeysController } from './api-keys.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([ApiKey, Site]), AuthModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
