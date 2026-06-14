import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ContentEntriesService } from './content-entries.service.js';
import { CreateContentEntryDto } from './dto/create-content-entry.dto.js';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto.js';
import { ListEntriesDto } from './dto/list-entries.dto.js';
import { ContentEntry } from './entities/content-entry.entity.js';

@Controller('sites/:siteId/entries')
@UseGuards(JwtAuthGuard)
export class ContentEntriesController {
  constructor(private readonly contentEntriesService: ContentEntriesService) {}

  @Get()
  findAll(
    @Param('siteId') siteId: string,
    @Query() filters: ListEntriesDto,
  ): Promise<ContentEntry[]> {
    return this.contentEntriesService.findAll(siteId, filters);
  }

  @Post()
  create(
    @Param('siteId') siteId: string,
    @Body() dto: CreateContentEntryDto,
  ): Promise<ContentEntry> {
    return this.contentEntriesService.create(siteId, dto);
  }

  @Get(':id')
  findOne(@Param('siteId') siteId: string, @Param('id') id: string): Promise<ContentEntry> {
    return this.contentEntriesService.findOne(id, siteId);
  }

  @Patch(':id')
  update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContentEntryDto,
  ): Promise<ContentEntry> {
    return this.contentEntriesService.update(id, siteId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('siteId') siteId: string, @Param('id') id: string): Promise<void> {
    return this.contentEntriesService.remove(id, siteId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('siteId') siteId: string, @Param('id') id: string): Promise<ContentEntry> {
    return this.contentEntriesService.publish(id, siteId);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(@Param('siteId') siteId: string, @Param('id') id: string): Promise<ContentEntry> {
    return this.contentEntriesService.unpublish(id, siteId);
  }
}
