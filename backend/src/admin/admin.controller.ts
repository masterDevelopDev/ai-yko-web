import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags } from '@nestjs/swagger';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { UserProfileDto } from '../user/dto/user-profile.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { Role } from '@prisma/client';
import { Roles } from '../iam/decorators/roles.decorator';

@Roles(Role.ADMIN)
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAllUsers(
    @ActiveUser() user: ActiveUserData,
    @Query('searchText') searchText?: string,
  ): Promise<UserProfileDto[]> {
    return this.adminService.findAllUsersExceptMe(user.sub, searchText);
  }

  @Patch('user-permissions/:id')
  updateUserPermissions(
    @ActiveUser() user: ActiveUserData,
    @Param('id') id: string,
    @Body() { newRole, newStatus }: UpdateUserPermissionsDto,
  ) {
    return this.adminService.updateRole(user.sub, id, { newRole, newStatus });
  }
}
