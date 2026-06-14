import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApiKeysService } from './api-keys.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { ApiKeyResponseDto } from './dto/api-key-response.dto.js';

@Controller('sites/:siteId/api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  findBySite(@Param('siteId') siteId: string): Promise<ApiKeyResponseDto[]> {
    return this.apiKeysService.findBySite(siteId);
  }

  @Post()
  generate(
    @Param('siteId') siteId: string,
    @Body() dto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.generate(siteId, dto);
  }

  @Delete(':keyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(@Param('keyId') keyId: string): Promise<void> {
    return this.apiKeysService.revoke(keyId);
  }
}
