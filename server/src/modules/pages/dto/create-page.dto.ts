import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { PageStatus } from '../entities/page.entity.js';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsBoolean()
  isHomepage?: boolean;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}
