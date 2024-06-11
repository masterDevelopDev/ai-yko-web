import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';

export class UserProfileDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  isEmailValidated: boolean;

  @IsEnum(Role)
  @ApiProperty({
    enum: Role,
  })
  role: Role;

  @IsEnum(UserStatus)
  @ApiProperty({
    enum: UserStatus,
  })
  status: UserStatus;
}
