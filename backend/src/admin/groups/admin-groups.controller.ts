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
import { CreateGroupDto, UpdateGroupDto } from './admin-groups.dto';
import { AdminGroupsService } from './admin-groups.service';

@Controller('admin/groups')
@UseGuards(AdminJwtGuard)
export class AdminGroupsController {
  constructor(private readonly groups: AdminGroupsService) {}

  @Get()
  findAll(
    @Query('page') pageRaw?: string,
    @Query('perPage') perPageRaw?: string,
    @Query('q') q?: string,
  ) {
    const { page, perPage } = parsePaginationQuery(pageRaw, perPageRaw);
    return this.groups.findAll(page, perPage, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groups.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groups.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGroupDto) {
    return this.groups.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groups.remove(id);
  }
}
