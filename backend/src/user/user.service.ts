import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthenticationService } from '../iam/authentication/authentication.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async getUser(id: string) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailValidated: true,
        role: true,
        status: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailValidated: user.isEmailValidated,
      isAdmin: user.role !== 'USER',
      role: user.role,
      status: user.status,
    };
  }

  async updateProfile(
    userId: string,
    currentEmail: string,
    {
      currentPassword,
      email,
      firstName,
      lastName,
      newPassword,
    }: UpdateUserProfileDto,
  ) {
    let hasVerificationEmailBeenSent = false;

    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException(
          'current Password must be provided to update password',
        );
      }

      await this.authenticationService.updatePassword(
        userId,
        currentPassword,
        newPassword,
      );
    }

    if (email) {
      hasVerificationEmailBeenSent =
        await this.authenticationService.sendEmailForEmailUpdate(
          userId,
          currentEmail,
          email,
        );
    }

    if (firstName || lastName) {
      const data = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      };

      await this.prismaService.user.update({
        data,
        where: {
          id: userId,
        },
      });
    }

    return {
      hasVerificationEmailBeenSent,
    };
  }
}
