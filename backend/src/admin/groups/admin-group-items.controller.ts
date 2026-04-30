import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { CreateGroupItemDto, UpdateGroupItemDto } from './admin-group-items.dto';
import { AdminGroupItemsService } from './admin-group-items.service';

@Controller('admin/groups/:groupId/items')
@UseGuards(AdminJwtGuard)
export class AdminGroupItemsController {
  constructor(private readonly items: AdminGroupItemsService) {}

  @Get()
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.items.findAll(groupId);
  }

  @Get(':itemId')
  findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.items.findOne(groupId, itemId);
  }

  @Post()
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupItemDto,
  ) {
    return this.items.create(groupId, dto);
  }

  @Patch(':itemId')
  update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateGroupItemDto,
  ) {
    return this.items.update(groupId, itemId, dto);
  }

  @Delete(':itemId')
  remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.items.remove(groupId, itemId);
  }
}
