import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ContentStatus } from '../entities/content-entry.entity.js';

export class ListEntriesDto {
  @IsOptional()
  @IsUUID()
  contentTypeId?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}
