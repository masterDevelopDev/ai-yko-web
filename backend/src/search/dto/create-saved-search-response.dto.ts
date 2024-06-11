import { IsString } from 'class-validator';

export class CreateSavedSearchResponseDto {
  @IsString()
  name: string;
}
