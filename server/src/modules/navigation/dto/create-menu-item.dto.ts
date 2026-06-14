import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  menuName?: string;
}
