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
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NavigationService } from './navigation.service.js';
import { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';

class ListMenuItemsQuery {
  @IsOptional()
  @IsString()
  menuName?: string;
}

@Controller('sites/:siteId/menu-items')
@UseGuards(JwtAuthGuard)
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  async create(@Param('siteId') siteId: string, @Body() dto: CreateMenuItemDto) {
    return this.navigationService.create(siteId, dto);
  }

  @Get()
  async findAll(@Param('siteId') siteId: string, @Query() query: ListMenuItemsQuery) {
    return this.navigationService.findAll(siteId, query.menuName);
  }

  @Patch(':id')
  async update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.navigationService.update(siteId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('siteId') siteId: string, @Param('id') id: string) {
    await this.navigationService.remove(siteId, id);
    return { deleted: true };
  }

  @Post('reorder')
  async reorder(@Param('siteId') siteId: string, @Body() dto: { itemIds: string[] }) {
    return this.navigationService.reorder(siteId, dto.itemIds);
  }
}
