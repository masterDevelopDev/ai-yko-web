import { IsJWT } from 'class-validator';

export class SignOutDto {
  @IsJWT()
  accessToken: string;

  @IsJWT()
  refreshToken: string;
}
