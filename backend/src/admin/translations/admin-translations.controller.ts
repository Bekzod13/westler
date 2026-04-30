import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { parsePaginationQuery } from '../common/admin-pagination';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { UpdateTranslationContentDto } from './admin-translations.dto';
import { AdminTranslationsService } from './admin-translations.service';

@Controller('admin/translations')
@UseGuards(AdminJwtGuard)
export class AdminTranslationsController {
  constructor(private readonly translations: AdminTranslationsService) {}

  @Get()
  findAll(
    @Query('modelType') modelType?: string,
    @Query('modelId') modelIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    let modelId: number | undefined;
    if (modelIdRaw !== undefined && modelIdRaw !== '') {
      const n = Number.parseInt(modelIdRaw, 10);
      if (Number.isNaN(n) || n < 0) {
        throw new BadRequestException('modelId must be a non-negative integer');
      }
      modelId = n;
    }
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.translations.findAll(modelType, modelId, page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.translations.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTranslationContentDto,
  ) {
    return this.translations.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.translations.remove(id);
  }
}
