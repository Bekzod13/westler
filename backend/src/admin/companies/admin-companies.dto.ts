import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  image: string;

  @IsOptional()
  @IsInt()
  openedYear?: number;

  @IsOptional()
  @IsObject()
  elements?: Record<string, unknown>;

  /** Optional integration ids (e.g. Telegram); empty string clears. */
  @IsOptional()
  @IsString()
  @MaxLength(512)
  chatId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  botToken?: string;

  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
