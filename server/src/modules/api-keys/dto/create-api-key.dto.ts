import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsUUID()
  siteId!: string;
}
