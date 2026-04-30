import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePublicOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  phone: string;

  @IsOptional()
  @MaxLength(320)
  email?: string;

  @IsOptional()
  @MaxLength(20000)
  message?: string;
}
