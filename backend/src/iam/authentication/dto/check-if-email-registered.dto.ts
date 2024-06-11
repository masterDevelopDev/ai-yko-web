import { IsEmail } from 'class-validator';

export class CheckIfEmailRegisteredDto {
  @IsEmail()
  email: string;
}
