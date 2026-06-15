import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Asset, AssetCategory } from './entities/asset.entity.js';
import { AssetStorage } from './storage/asset-storage.interface.js';
import { ImageProcessor } from './image-processor.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { Site } from '../sites/entities/site.entity.js';

const IMAGE_MIME_PREFIX = 'image/';
const SVG_MIME = 'image/svg+xml';

@Injectable()
export class AssetsService {
  constructor(
    private readonly em: EntityManager,
    @Inject('AssetStorage') private readonly storage: AssetStorage,
    private readonly imageProcessor: ImageProcessor,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async store(
    siteId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    category: AssetCategory = AssetCategory.OTHER,
  ): Promise<Asset> {
    const ext = path.extname(originalName) || '';
    const baseName = uuidv4();
    const safeName = `${baseName}${ext}`;
    const storagePath = await this.storage.store(buffer, siteId, safeName);

    const asset = new Asset();
    asset.site = this.em.getReference(Site, siteId);
    asset.originalName = originalName;
    asset.storagePath = storagePath;
    asset.mimeType = mimeType;
    asset.size = buffer.length;
    asset.category = category;

    // Generate image variants for raster images (skip SVG)
    if (mimeType.startsWith(IMAGE_MIME_PREFIX) && mimeType !== SVG_MIME) {
      const variants = await this.imageProcessor.generateVariants(buffer, safeName);
      const variantEntries: Record<string, unknown> = {};

      for (const v of variants) {
        const variantPath = await this.storage.store(v.buffer, siteId, v.filename);
        variantEntries[v.suffix] = {
          path: variantPath,
          width: v.width,
          height: v.height,
          size: v.size,
        };
      }

      if (Object.keys(variantEntries).length > 0) {
        asset.variants = variantEntries;
      }
    }

    this.em.persist(asset);
    await this.em.flush();

    this.logActivity({ action: 'asset.created', entityId: asset.id, siteId });
    return asset;
  }

  async findOne(siteId: string, assetId: string): Promise<Asset> {
    const asset = await this.em.findOne(Asset, {
      id: assetId,
      site: { id: siteId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset ${assetId} not found`);
    }
    return asset;
  }

  async findAll(siteId: string, category?: AssetCategory): Promise<Asset[]> {
    const where: Record<string, unknown> = { site: { id: siteId } };
    if (category !== undefined) {
      where['category'] = category;
    }
    return this.em.find(Asset, where, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async remove(siteId: string, assetId: string): Promise<void> {
    const asset = await this.findOne(siteId, assetId);
    await this.storage.delete(asset.storagePath);

    // Delete variant files
    if (asset.variants) {
      for (const v of Object.values(asset.variants)) {
        if (v && typeof v === 'object' && 'path' in v) {
          await this.storage.delete(String(v.path));
        }
      }
    }

    this.em.remove(asset);
    await this.em.flush();

    this.logActivity({ action: 'asset.deleted', entityId: assetId, siteId });
  }

  getAbsolutePath(asset: Asset): string {
    return this.storage.getAbsolutePath(asset.storagePath);
  }

  private logActivity(params: { action: string; entityId: string; siteId: string }): void {
    this.activityLogService
      .log({
        action: params.action,
        entityType: 'Asset',
        entityId: params.entityId,
        siteId: params.siteId,
      })
      .catch(() => {});
  }
}
