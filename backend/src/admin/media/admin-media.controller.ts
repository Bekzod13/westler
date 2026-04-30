import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { AdminMediaService } from './admin-media.service';

const MAX_BYTES = 5 * 1024 * 1024;

@Controller('admin/media')
@UseGuards(AdminJwtGuard)
export class AdminMediaController {
  constructor(private readonly media: AdminMediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_BYTES },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Expected multipart field "file"');
    }
    return this.media.saveAsWebp(file.buffer);
  }
}
