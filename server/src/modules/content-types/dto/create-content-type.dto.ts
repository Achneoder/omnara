import { IsString, IsNotEmpty, IsOptional, IsObject, Matches } from 'class-validator';

export class CreateContentTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @IsOptional()
  @IsObject()
  fieldSchema?: Record<string, unknown>;
}
