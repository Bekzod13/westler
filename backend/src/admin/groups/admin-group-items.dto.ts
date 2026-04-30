import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsObject, IsOptional } from 'class-validator';

export class CreateGroupItemDto {
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdateGroupItemDto extends PartialType(CreateGroupItemDto) {}
