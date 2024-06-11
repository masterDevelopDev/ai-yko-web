import { IsBoolean } from 'class-validator';

export class CheckIfEmailRegisteredResponseDto {
  @IsBoolean()
  isEmailAlreadyRegistered: boolean;
}
