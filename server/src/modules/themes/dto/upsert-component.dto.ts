import { IsString, IsObject, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ComponentCategory } from '../entities/theme-component.entity.js';

export class UpsertComponentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(ComponentCategory)
  category!: ComponentCategory;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsOptional()
  @IsString()
  css?: string | null;

  @IsOptional()
  @IsObject()
  propsSchema?: Record<string, string>;
}
