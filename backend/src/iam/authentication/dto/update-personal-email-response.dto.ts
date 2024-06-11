import { IsBoolean } from 'class-validator';

export class UpdatePersonalEmailResponseDto {
  @IsBoolean()
  success: boolean;
}
