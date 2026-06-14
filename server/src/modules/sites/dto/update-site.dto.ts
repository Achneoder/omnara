import { IsString, IsNotEmpty, IsUrl, IsEnum, IsOptional, IsObject } from 'class-validator';
import { SitePlatform } from '../entities/site.entity.js';

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsEnum(SitePlatform)
  platform?: SitePlatform;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
