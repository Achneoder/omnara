import { IsUrl, IsArray, IsString, ArrayNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateWebhookDto {
  @IsUrl()
  @IsOptional()
  url?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  eventTypes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
