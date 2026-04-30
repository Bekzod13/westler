import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { absolutizeUploadPath } from '../../common/upload-url';

@Injectable()
export class AdminMediaService implements OnModuleInit {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async onModuleInit(): Promise<void> {
    await mkdir(this.uploadRoot, { recursive: true });
  }

  /** Writes buffer as WebP; returns public URL path to store on entities. */
  async saveAsWebp(buffer: Buffer): Promise<{ url: string }> {
    await mkdir(this.uploadRoot, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const filePath = join(this.uploadRoot, filename);
    try {
      await sharp(buffer).webp({ quality: 85 }).toFile(filePath);
    } catch {
      throw new BadRequestException(
        'Could not decode image; upload a valid raster image',
      );
    }
    const relative = `/uploads/${filename}`;
    return { url: absolutizeUploadPath(relative) ?? relative };
  }
}
