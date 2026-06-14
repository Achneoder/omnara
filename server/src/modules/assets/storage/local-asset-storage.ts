import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import path from 'path';
import { AssetStorage } from './asset-storage.interface.js';

@Injectable()
export class LocalAssetStorage implements AssetStorage {
  private readonly logger = new Logger(LocalAssetStorage.name);
  private readonly baseDir: string;

  constructor(private readonly configService: ConfigService) {
    this.baseDir = this.configService.get('ASSETS_DIR', './uploads');
  }

  async store(buffer: Buffer, siteId: string, filename: string): Promise<string> {
    const dir = path.resolve(this.baseDir, siteId);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);

    const relativePath = path.join(siteId, filename);
    this.logger.debug(`Stored asset: ${relativePath} (${buffer.length} bytes)`);
    return relativePath;
  }

  async delete(storagePath: string): Promise<void> {
    const absolutePath = path.resolve(this.baseDir, storagePath);
    try {
      await fs.unlink(absolutePath);
      this.logger.debug(`Deleted asset: ${storagePath}`);
    } catch (err) {
      // File not found is not an error for deletion
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  getAbsolutePath(storagePath: string): string {
    return path.resolve(this.baseDir, storagePath);
  }
}
