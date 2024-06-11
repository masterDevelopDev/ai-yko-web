import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import jwtConfig from '../../../iam/config/jwt.config';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';
import { extractTokenFromHeader } from '../utils/extract-token-from-header.util';
import { TokenIsNotForGeneralPurposeAccessException } from '../exceptions/is-not-general-purpose-access-token.exception';
import { TokenStorage } from '../token.storage/token.storage';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenStorage: TokenStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();

    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      if (!payload.isGeneralPurposeAccessToken) {
        throw new TokenIsNotForGeneralPurposeAccessException();
      }

      const isValid = this.tokenStorage.validate(payload.sub, payload.tokenId);

      if (!isValid) {
        throw new UnauthorizedException('Token is invalid');
      }

      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      if (error instanceof TokenIsNotForGeneralPurposeAccessException) {
        throw new TokenIsNotForGeneralPurposeAccessException();
      }

      throw new UnauthorizedException();
    }
    return true;
  }
}
