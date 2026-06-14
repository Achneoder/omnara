import {
  IsString,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ComponentCategory } from '../entities/theme-component.entity.js';

export class ImportThemeMetaDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;

  @IsObject()
  tokens!: Record<string, string>;

  @IsOptional()
  @IsString()
  rawCss?: string | null;
}

export class ImportThemeComponentDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

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

export class ImportThemeDto {
  @ValidateNested()
  @Type(() => ImportThemeMetaDto)
  theme!: ImportThemeMetaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportThemeComponentDto)
  components?: ImportThemeComponentDto[];
}
