import { IsEmail } from 'class-validator';

export class AskResetPasswordDto {
  @IsEmail()
  email: string;
}
