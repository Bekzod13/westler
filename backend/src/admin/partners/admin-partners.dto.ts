import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  image: string;

  @IsString()
  link: string;

  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
