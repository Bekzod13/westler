import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTranslationContentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
