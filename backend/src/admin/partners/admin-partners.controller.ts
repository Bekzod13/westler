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
import { CreatePartnerDto, UpdatePartnerDto } from './admin-partners.dto';
import { AdminPartnersService } from './admin-partners.service';

@Controller('admin/partners')
@UseGuards(AdminJwtGuard)
export class AdminPartnersController {
  constructor(private readonly partners: AdminPartnersService) {}

  @Get()
  findAll(
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.partners.findAll(page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partners.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.partners.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerDto) {
    return this.partners.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partners.remove(id);
  }
}
