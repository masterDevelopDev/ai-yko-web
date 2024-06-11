import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Prisma, User, UserStatus } from '@prisma/client';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailService } from '../../email/email.service';
import { TokenStorage } from './token.storage/token.storage';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthenticationService {
  private logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenStorage: TokenStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const { password, email, firstName, lastName } = signUpDto;

      const hashedPassword = await this.hashingService.hash(password);

      const user = await this.prismaService.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
        },
      });

      await this.sendEmailForEmailVerification(user.id);

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException();
        }
      }
      throw error;
    }
  }

  async updatePassword(userId: string, password: string, newPassword: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    const isEqual = await this.hashingService.compare(password, user.password);

    if (!isEqual) {
      throw new UnauthorizedException({
        frontendMessage: 'The current password you provided is incorrect!',
      });
    }

    const hashedPassword = await this.hashingService.hash(newPassword);

    await this.prismaService.user.update({
      data: {
        password: hashedPassword,
      },
      where: {
        id: userId,
      },
    });
  }

  async sendEmailForEmailUpdate(
    userId: string,
    currentEmail: string,
    newEmail: string,
  ) {
    if (currentEmail === newEmail) {
      return false;
    }

    try {
      const token = await this.signToken(userId, '15m', {
        newEmail,
        isGeneralPurposeAccessToken: false,
      });

      const validationUrl = `${this.configService.get('FRONTEND_URL')}/update-email?token=${token}`;

      const text = `Your verification link: ${validationUrl}`;

      await this.emailService.sendEmail({
        text,
        subject: 'Your email verification link - AI-YKO',
        to: newEmail,
        html: text,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async confirmProfileEmailUpdate(token: string) {
    try {
      const { sub, newEmail } = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      await this.prismaService.user.update({
        data: { email: newEmail },
        where: { id: sub },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(error);

      return { success: false };
    }
  }

  async sendEmailForEmailVerification(userId: string) {
    const { email } = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    const verificationToken = await this.signToken(userId, '15m', {
      emailToValidate: email,
      isGeneralPurposeAccessToken: false,
    });

    const validationUrl = `${this.configService.get('FRONTEND_URL')}/validate-email?token=${verificationToken}`;

    const text = `Email validation URL: ${validationUrl}`;

    this.emailService.sendEmail({
      text,
      subject: 'Your email verification link - AI-YKO',
      to: email,
      html: text,
    });
  }

  async checkIfEmailRegistered(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });

    return {
      isEmailAlreadyRegistered: !!user,
    };
  }

  async checkTokenAndResetPassword(token: string, password: string) {
    const { sub, isForPasswordResetOnly } = await this.jwtService.verifyAsync(
      token,
      this.jwtConfiguration,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        id: sub,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (!isForPasswordResetOnly) {
      throw new BadRequestException(
        'Token should not be used to reset password',
      );
    }

    const hashedPassword = await this.hashingService.hash(password);

    await this.prismaService.user.update({
      data: { password: hashedPassword },
      where: { id: sub },
    });

    return this.generateTokens(user);
  }

  async sendResetPasswordEmailIfEmailRegistered(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
        status: UserStatus.ACTIVE,
      },
    });

    if (user && user.isEmailValidated) {
      const passwordResetToken = await this.signToken(user.id, '15m', {
        isForPasswordResetOnly: true,
        isGeneralPurposeAccessToken: false,
      });

      const passwordResetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${passwordResetToken}`;

      const text = `Password reset URL: ${passwordResetUrl}`;

      this.emailService.sendEmail({
        text,
        subject: 'Your password reset link - AI-YKO',
        to: email,
        html: text,
      });
    }
  }

  async validateEmail(emailValidationToken: string) {
    try {
      const { sub, emailToValidate } = await this.jwtService.verifyAsync(
        emailValidationToken,
        this.jwtConfiguration,
      );

      const user = await this.prismaService.user.findUnique({
        where: {
          id: sub,
        },
      });

      if (user.isEmailValidated) {
        throw new ConflictException();
      }

      if (user.email !== emailToValidate) {
        throw new BadRequestException({
          message: 'Token was issued for another email that the current one',
        });
      }

      await this.prismaService.user.update({
        data: {
          isEmailValidated: true,
        },
        where: {
          id: sub,
        },
      });

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException(
        'This verification token could not be verified',
      );
    }
  }

  async resendVerificationEmail(accessToken: string) {
    const payload = await this.jwtService.verifyAsync(
      accessToken,
      this.jwtConfiguration,
    );

    await this.sendEmailForEmailVerification(payload.sub);
  }

  private async signToken<T>(
    userId: string,
    expiresIn: number | string,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        isGeneralPurposeAccessToken: true,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async generateTokens(user: User) {
    const accessTokenId = randomUUID();
    const refreshTokenId = randomUUID();

    await Promise.all([
      this.tokenStorage.insert(
        user.id,
        accessTokenId,
        this.jwtConfiguration.accessTokenTtl,
      ),
      this.tokenStorage.insert(
        user.id,
        refreshTokenId,
        this.jwtConfiguration.refreshTokenTtl,
      ),
    ]);

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          isGeneralPurposeAccessToken: user.isEmailValidated,
          role: user.role,
          tokenId: accessTokenId,
        },
      ),
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        {
          tokenId: refreshTokenId,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: signInDto.email,
        status: UserStatus.ACTIVE,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }

    return await this.generateTokens(user);
  }

  async signOut(accessToken: string, refreshToken: string) {
    const [
      { sub: userId, tokenId: accessTokenId },
      { tokenId: refreshTokenId },
    ] = await Promise.all([
      this.jwtService.verifyAsync(accessToken, this.jwtConfiguration),
      this.jwtService.verifyAsync(refreshToken, this.jwtConfiguration),
    ]);

    await Promise.all([
      this.tokenStorage.invalidateKey(userId, accessTokenId),
      this.tokenStorage.invalidateKey(userId, refreshTokenId),
    ]);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, tokenId: refreshTokenId } =
        await this.jwtService.verifyAsync<ActiveUserData>(
          refreshTokenDto.refreshToken,
          {
            secret: this.jwtConfiguration.secret,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
          },
        );

      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: sub,
          status: UserStatus.ACTIVE,
        },
      });

      const isValid = await this.tokenStorage.validate(user.id, refreshTokenId);

      if (isValid) {
        await this.tokenStorage.invalidateKey(user.id, refreshTokenId);
      } else {
        throw new Error('Refresh token is invalid');
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async checkIfAuthenticated(accessToken: string) {
    try {
      const { sub, tokenId } = await this.jwtService.verifyAsync(
        accessToken,
        this.jwtConfiguration,
      );

      const isValid = await this.tokenStorage.validate(sub, tokenId);

      if (!isValid) return { isAuthenticated: false };

      const { isEmailValidated } = await this.prismaService.user.findUnique({
        where: { id: sub },
      });

      return {
        isAuthenticated: true,
        isEmailValidated,
      };
    } catch {
      return {
        isAuthenticated: false,
      };
    }
  }

  async deactivateUser(userId: string) {
    await this.tokenStorage.invalidateKeys(userId);
  }
}
