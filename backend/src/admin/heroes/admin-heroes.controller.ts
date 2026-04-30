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
import { CreateHeroDto, UpdateHeroDto } from './admin-heroes.dto';
import { AdminHeroesService } from './admin-heroes.service';

@Controller('admin/heroes')
@UseGuards(AdminJwtGuard)
export class AdminHeroesController {
  constructor(private readonly heroes: AdminHeroesService) {}

  @Get()
  findAll(
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.heroes.findAll(page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.heroes.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateHeroDto) {
    return this.heroes.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroDto) {
    return this.heroes.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.heroes.remove(id);
  }
}
