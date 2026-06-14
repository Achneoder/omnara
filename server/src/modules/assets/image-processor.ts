import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageVariant {
  suffix: string;
  width: number;
  height?: number;
  format: 'webp';
  quality?: number;
}

export interface GeneratedVariant {
  suffix: string;
  width: number;
  height: number;
  size: number;
  filename: string;
  buffer: Buffer;
}

const VARIANTS: ImageVariant[] = [
  { suffix: 'sm', width: 640, format: 'webp', quality: 80 },
  { suffix: 'md', width: 1280, format: 'webp', quality: 80 },
  { suffix: 'lg', width: 1920, format: 'webp', quality: 80 },
];

const THUMBNAIL: ImageVariant = {
  suffix: 'thumb',
  width: 320,
  height: 320,
  format: 'webp',
  quality: 75,
};

@Injectable()
export class ImageProcessor {
  private readonly logger = new Logger(ImageProcessor.name);

  async generateVariants(buffer: Buffer, baseFilename: string): Promise<GeneratedVariant[]> {
    const results: GeneratedVariant[] = [];

    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) return [];

      // Thumbnail (square crop)
      results.push(await this.processVariant(buffer, baseFilename, THUMBNAIL, true));

      // Responsive sizes — skip sizes larger than original
      for (const variant of VARIANTS) {
        if (variant.width >= metadata.width) continue;
        results.push(await this.processVariant(buffer, baseFilename, variant, false));
      }

      this.logger.debug(
        `Generated ${results.length} variants for ${baseFilename} (${metadata.width}x${metadata.height})`,
      );
    } catch (err) {
      this.logger.warn(`Failed to process image ${baseFilename}: ${(err as Error).message}`);
    }

    return results;
  }

  private async processVariant(
    buffer: Buffer,
    baseFilename: string,
    variant: ImageVariant,
    crop: boolean,
  ): Promise<GeneratedVariant> {
    let pipeline = sharp(buffer).resize({
      width: variant.width,
      height: variant.height,
      fit: crop ? 'cover' : 'inside',
      withoutEnlargement: true,
    });

    pipeline = pipeline.webp({ quality: variant.quality ?? 80 });

    const outputBuffer = await pipeline.toBuffer();
    const filename = baseFilename.replace(/(\.[^.]+)$/, `-${variant.suffix}.webp`);

    return {
      suffix: variant.suffix,
      width: variant.width,
      height: variant.height ?? 0,
      size: outputBuffer.length,
      filename,
      buffer: outputBuffer,
    };
  }
}
