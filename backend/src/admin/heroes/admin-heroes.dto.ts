import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateHeroDto {
  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  image?: string;

  /** Keys = language codes (all active languages required on create) */
  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdateHeroDto extends PartialType(CreateHeroDto) {}
