import { IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  props?: Record<string, unknown>;
}
