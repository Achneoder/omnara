import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class AttachMediaDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;
}
