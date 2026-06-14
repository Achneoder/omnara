import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ContentTypesService } from './content-types.service.js';
import { CreateContentTypeDto } from './dto/create-content-type.dto.js';
import { UpdateContentTypeDto } from './dto/update-content-type.dto.js';
import { ContentType } from './entities/content-type.entity.js';

@Controller('sites/:siteId/content-types')
@UseGuards(JwtAuthGuard)
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Get()
  findAll(@Param('siteId') siteId: string): Promise<ContentType[]> {
    return this.contentTypesService.findAll(siteId);
  }

  @Post()
  create(@Param('siteId') siteId: string, @Body() dto: CreateContentTypeDto): Promise<ContentType> {
    return this.contentTypesService.create(siteId, dto);
  }

  @Get(':id')
  findOne(@Param('siteId') siteId: string, @Param('id') id: string): Promise<ContentType> {
    return this.contentTypesService.findOne(id, siteId);
  }

  @Patch(':id')
  update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContentTypeDto,
  ): Promise<ContentType> {
    return this.contentTypesService.update(id, siteId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('siteId') siteId: string, @Param('id') id: string): Promise<void> {
    return this.contentTypesService.remove(id, siteId);
  }
}
