import { IsString, IsObject, IsOptional } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsObject()
  tokens?: Record<string, string>;

  @IsOptional()
  @IsString()
  rawCss?: string | null;
}
