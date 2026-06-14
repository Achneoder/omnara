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
import { MediaReferencesService } from './media-references.service.js';
import { AttachMediaDto } from './dto/attach-media.dto.js';
import { MediaReference } from './entities/media-reference.entity.js';

@Controller('sites/:siteId/entries/:entryId/media')
@UseGuards(JwtAuthGuard)
export class MediaReferencesController {
  constructor(private readonly mediaReferencesService: MediaReferencesService) {}

  @Get()
  findByEntry(
    @Param('siteId') siteId: string,
    @Param('entryId') entryId: string,
  ): Promise<MediaReference[]> {
    return this.mediaReferencesService.findByEntry(entryId, siteId);
  }

  @Post()
  attach(
    @Param('siteId') siteId: string,
    @Param('entryId') entryId: string,
    @Body() dto: AttachMediaDto,
  ): Promise<MediaReference> {
    return this.mediaReferencesService.attach(entryId, siteId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @Param('siteId') siteId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.mediaReferencesService.detach(id, entryId, siteId);
  }
}
