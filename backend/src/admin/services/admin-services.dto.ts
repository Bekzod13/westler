import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  image: string;

  @IsObject()
  translations: Record<string, Record<string, string>>;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
