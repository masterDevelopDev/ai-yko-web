import { IsJWT } from 'class-validator';

export class AccessTokensDto {
  @IsJWT()
  accessToken: string;

  @IsJWT()
  refreshToken: string;
}
