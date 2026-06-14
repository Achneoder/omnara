import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsOptional, IsEnum } from 'class-validator';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AssetsService } from './assets.service.js';
import { AssetCategory } from './entities/asset.entity.js';

class ListAssetsQuery {
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;
}

@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('sites/:siteId/assets/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async upload(@Param('siteId') siteId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const asset = await this.assetsService.store(
      siteId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return this.toAssetResponse(asset, siteId);
  }

  @Get('sites/:siteId/assets')
  @UseGuards(JwtAuthGuard)
  async list(@Param('siteId') siteId: string, @Query() query: ListAssetsQuery) {
    const assets = await this.assetsService.findAll(siteId, query.category);
    return assets.map((a) => this.toAssetResponse(a, siteId));
  }

  @Delete('sites/:siteId/assets/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('siteId') siteId: string, @Param('id') id: string) {
    await this.assetsService.remove(siteId, id);
    return { deleted: true };
  }

  @Get('assets/:siteId/:assetId/:filename')
  async serve(
    @Param('siteId') siteId: string,
    @Param('assetId') assetId: string,
    @Res() res: Response,
  ) {
    const asset = await this.assetsService.findOne(siteId, assetId);
    const absolutePath = this.assetsService.getAbsolutePath(asset);
    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(absolutePath);
  }

  private toAssetResponse(
    a: {
      id: string;
      originalName: string;
      mimeType: string;
      size: number;
      category: string;
      variants?: Record<string, unknown> | null;
    },
    siteId: string,
  ) {
    const baseUrl = `/assets/${siteId}/${a.id}/${encodeURIComponent(a.originalName)}`;

    const variantUrls: Record<string, string> = {};
    if (a.variants) {
      for (const [suffix, v] of Object.entries(a.variants)) {
        if (v && typeof v === 'object' && 'path' in v) {
          variantUrls[suffix] =
            `/assets/${siteId}/${a.id}/${encodeURIComponent(`${a.originalName.replace(/\.[^.]+$/, '')}-${suffix}.webp`)}`;
        }
      }
    }

    return {
      id: a.id,
      originalName: a.originalName,
      mimeType: a.mimeType,
      size: a.size,
      category: a.category,
      url: baseUrl,
      variants: variantUrls,
    };
  }
}
