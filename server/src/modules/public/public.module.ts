import { Module } from '@nestjs/common';
import { PublicController } from './public.controller.js';
import { ThemesModule } from '../themes/themes.module.js';

@Module({
  imports: [ThemesModule],
  controllers: [PublicController],
})
export class PublicModule {}
