import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsEnum,
  IsOptional,
  IsObject,
  Matches,
} from 'class-validator';
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
  @IsString()
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9\-.]*[a-zA-Z0-9])?$/, {
    message:
      'domain must be a valid hostname without protocol or trailing slash (e.g. "myblog.com")',
  })
  domain?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
