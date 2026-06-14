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
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ThemesService } from './themes.service.js';
import { ImportThemeDto } from './dto/import-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';
import { UpsertComponentDto } from './dto/upsert-component.dto.js';
import { SiteTheme } from './entities/site-theme.entity.js';
import { ThemeComponent } from './entities/theme-component.entity.js';
import { IsString, IsOptional } from 'class-validator';

class AssignComponentDto {
  @IsString()
  contentTypeSlug!: string;

  @IsOptional()
  @IsString()
  componentSlug!: string | null;
}

@Controller('sites/:siteId/theme')
@UseGuards(JwtAuthGuard)
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  async getTheme(@Param('siteId') siteId: string): Promise<SiteTheme> {
    const theme = await this.themesService.getTheme(siteId);
    if (!theme) {
      throw new NotFoundException(`Theme for site ${siteId} not found`);
    }
    return theme;
  }

  @Patch()
  updateTheme(@Param('siteId') siteId: string, @Body() dto: UpdateThemeDto): Promise<SiteTheme> {
    return this.themesService.updateTheme(siteId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTheme(@Param('siteId') siteId: string): Promise<void> {
    return this.themesService.deleteTheme(siteId);
  }

  @Post('import')
  importTheme(@Param('siteId') siteId: string, @Body() dto: ImportThemeDto): Promise<SiteTheme> {
    return this.themesService.importTheme(siteId, dto);
  }

  @Get('components')
  listComponents(@Param('siteId') siteId: string): Promise<ThemeComponent[]> {
    return this.themesService.listComponents(siteId);
  }

  @Get('components/:slug')
  getComponent(
    @Param('siteId') siteId: string,
    @Param('slug') slug: string,
  ): Promise<ThemeComponent> {
    return this.themesService.getComponent(siteId, slug);
  }

  @Patch('components/:slug')
  upsertComponent(
    @Param('siteId') siteId: string,
    @Param('slug') slug: string,
    @Body() dto: UpsertComponentDto,
  ): Promise<ThemeComponent> {
    return this.themesService.upsertComponent(siteId, slug, dto);
  }

  @Delete('components/:slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComponent(@Param('siteId') siteId: string, @Param('slug') slug: string): Promise<void> {
    return this.themesService.deleteComponent(siteId, slug);
  }

  @Post('assign-component')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignComponentToContentType(
    @Param('siteId') siteId: string,
    @Body() dto: AssignComponentDto,
  ): Promise<void> {
    return this.themesService.assignComponentToContentType(
      siteId,
      dto.contentTypeSlug,
      dto.componentSlug,
    );
  }
}
