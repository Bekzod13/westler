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
import { CreateServiceDto, UpdateServiceDto } from './admin-services.dto';
import { AdminServicesService } from './admin-services.service';

@Controller('admin/services')
@UseGuards(AdminJwtGuard)
export class AdminServicesController {
  constructor(private readonly services: AdminServicesService) {}

  @Get()
  findAll(
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.services.findAll(page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.services.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.services.remove(id);
  }
}
