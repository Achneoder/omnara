import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class AddSectionDto {
  @IsString()
  @IsNotEmpty()
  componentSlug!: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  props?: Record<string, unknown>;
}
