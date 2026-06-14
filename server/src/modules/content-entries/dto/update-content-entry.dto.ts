import { IsString, IsNotEmpty, IsOptional, IsObject, IsUUID, IsEnum } from 'class-validator';
import { ContentStatus } from '../entities/content-entry.entity.js';

export class UpdateContentEntryDto {
  @IsOptional()
  @IsUUID()
  contentTypeId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsObject()
  body?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  authorSessionId?: string;
}
