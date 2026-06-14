import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PagesService } from './pages.service.js';
import { PageStatus } from './entities/page.entity.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { AddSectionDto } from './dto/add-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { ReorderSectionsDto } from './dto/reorder-sections.dto.js';

class ListPagesQuery {
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

@Controller('sites/:siteId/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(@Param('siteId') siteId: string, @Body() dto: CreatePageDto) {
    return this.pagesService.create(siteId, dto);
  }

  @Get()
  async findAll(@Param('siteId') siteId: string, @Query() query: ListPagesQuery) {
    return this.pagesService.findAll(siteId, query.status);
  }

  @Get(':id')
  async findOne(@Param('siteId') siteId: string, @Param('id') id: string) {
    return this.pagesService.findOne(siteId, id);
  }

  @Patch(':id')
  async update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(siteId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('siteId') siteId: string, @Param('id') id: string) {
    await this.pagesService.remove(siteId, id);
    return { deleted: true };
  }

  @Post(':id/publish')
  async publish(@Param('siteId') siteId: string, @Param('id') id: string) {
    return this.pagesService.publish(siteId, id);
  }

  @Post(':id/unpublish')
  async unpublish(@Param('siteId') siteId: string, @Param('id') id: string) {
    return this.pagesService.unpublish(siteId, id);
  }

  @Post(':id/sections')
  async addSection(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: AddSectionDto,
  ) {
    return this.pagesService.addSection(siteId, id, dto);
  }

  @Patch(':id/sections/:sectionId')
  async updateSection(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.pagesService.updateSection(siteId, sectionId, dto);
  }

  @Delete(':id/sections/:sectionId')
  async removeSection(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
  ) {
    await this.pagesService.removeSection(siteId, sectionId);
    return { deleted: true };
  }

  @Post(':id/sections/reorder')
  async reorderSections(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: ReorderSectionsDto,
  ) {
    return this.pagesService.reorderSections(siteId, id, dto.sectionIds);
  }
}
