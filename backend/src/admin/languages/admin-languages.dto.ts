import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  /** ISO 639-1 style code, e.g. en, uz, ru */
  @IsString()
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/)
  code: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {}
