import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { parsePaginationQuery } from '../common/admin-pagination';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { CreateLanguageDto, UpdateLanguageDto } from './admin-languages.dto';
import { AdminLanguagesService } from './admin-languages.service';

@Controller('admin/languages')
@UseGuards(AdminJwtGuard)
export class AdminLanguagesController {
  constructor(private readonly languages: AdminLanguagesService) {}

  @Get()
  findAll(
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.languages.findAll(page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languages.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLanguageDto) {
    return this.languages.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.languages.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.languages.remove(id);
  }
}
