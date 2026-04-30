import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  /** URL-safe id for public API and frontend (e.g. header, footer). */
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, digits, and single hyphens (kebab-case)',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
