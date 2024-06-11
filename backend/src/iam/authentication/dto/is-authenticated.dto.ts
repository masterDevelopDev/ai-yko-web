import { IsBoolean, IsOptional } from 'class-validator';

export class IsAuthenticatedDto {
  @IsBoolean()
  isAuthenticated: boolean;

  @IsBoolean()
  @IsOptional()
  isEmailValidated?: boolean;
}
