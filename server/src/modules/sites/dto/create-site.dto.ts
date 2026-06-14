import { IsString, IsNotEmpty, IsUrl, IsEnum, IsOptional, IsObject } from 'class-validator';
import { SitePlatform } from '../entities/site.entity.js';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl()
  url!: string;

  @IsEnum(SitePlatform)
  platform!: SitePlatform;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
