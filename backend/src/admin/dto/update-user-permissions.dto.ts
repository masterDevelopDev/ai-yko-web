import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserPermissionsDto {
  @IsEnum(Role)
  @ApiProperty({
    enum: Role,
  })
  newRole: Role;

  @IsEnum(UserStatus)
  @ApiProperty({
    enum: UserStatus,
  })
  newStatus: UserStatus;
}
