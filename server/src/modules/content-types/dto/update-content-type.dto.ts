import { IsString, IsNotEmpty, IsOptional, IsObject, Matches } from 'class-validator';

export class UpdateContentTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsObject()
  fieldSchema?: Record<string, unknown>;
}
