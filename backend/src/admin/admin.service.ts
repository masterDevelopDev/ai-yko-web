import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserStatus } from '@prisma/client';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { AuthenticationService } from '../iam/authentication/authentication.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async findAllUsersExceptMe(userId: string, searchText: string) {
    let users = await this.prismaService.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (searchText) {
      const textToSearch = searchText.trim().toLowerCase();

      const filterUser = (user: User) => {
        return (
          user.firstName.toLowerCase().includes(textToSearch) ||
          user.lastName.toLowerCase().includes(textToSearch) ||
          (user.firstName + ' ' + user.lastName)
            .toLowerCase()
            .includes(textToSearch) ||
          user.email.toLowerCase().includes(textToSearch)
        );
      };

      users = users.filter(filterUser);
    }

    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async updateRole(
    updaterId: string,
    id: string,
    { newRole, newStatus }: UpdateUserPermissionsDto,
  ) {
    if (updaterId === id)
      throw new ForbiddenException('You cannot update your own role or status');

    if (newStatus === UserStatus.DEACTIVATED) {
      await this.authenticationService.deactivateUser(id);
    }

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: { role: newRole, status: newStatus },
    });
  }
}
