import { IsBoolean } from 'class-validator';

export class UpdateUserProfileResponseDto {
  @IsBoolean()
  hasVerificationEmailBeenSent?: boolean;
}
