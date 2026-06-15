import { IsUrl, IsArray, IsString, ArrayNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export const WEBHOOK_EVENT_TYPES = [
  'entry.created',
  'entry.updated',
  'entry.published',
  'entry.deleted',
  'page.published',
  'theme.imported',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export class CreateWebhookDto {
  @IsUrl()
  url!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  eventTypes!: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
