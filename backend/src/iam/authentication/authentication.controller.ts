import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FastifyRequest } from 'fastify';
import { IsAuthenticatedDto } from './dto/is-authenticated.dto';
import { AccessTokensDto } from './dto/access-tokens.dto';
import { ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { extractTokenFromHeader } from './utils/extract-token-from-header.util';
import { UpdatePersonalEmailResponseDto } from './dto/update-personal-email-response.dto';
import { CheckIfEmailRegisteredResponseDto } from './dto/check-if-email-registered-response.dto';
import { CheckIfEmailRegisteredDto } from './dto/check-if-email-registered.dto';
import { AskResetPasswordDto } from './dto/ask-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignOutDto } from './dto/sign-out.dto';

@ApiTags('authentication')
@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<AccessTokensDto> {
    return this.authService.signUp(signUpDto);
  }

  @ApiConflictResponse({
    description: 'The email for this user has already been validated',
  })
  @Post('validate-email')
  validateEmail(
    @Query('token') emailValidationToken: string,
  ): Promise<AccessTokensDto> {
    return this.authService.validateEmail(emailValidationToken);
  }

  @Get('resend-validation-email')
  resendValidationEmail(@Request() request: FastifyRequest) {
    const accessToken = extractTokenFromHeader(request);
    return this.authService.resendVerificationEmail(accessToken);
  }

  @Post('ask-reset-password')
  askResetPassword(@Body() { email }: AskResetPasswordDto) {
    return this.authService.sendResetPasswordEmailIfEmailRegistered(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body() { token, password }: ResetPasswordDto,
  ): Promise<AccessTokensDto> {
    return this.authService.checkTokenAndResetPassword(token, password);
  }

  @Get('update-personal-email')
  confirmProfileEmailUpdate(
    @Query('token') token: string,
  ): Promise<UpdatePersonalEmailResponseDto> {
    return this.authService.confirmProfileEmailUpdate(token);
  }

  @Get('check-if-email-registered')
  checkIfEmailRegistered(
    @Query() { email }: CheckIfEmailRegisteredDto,
  ): Promise<CheckIfEmailRegisteredResponseDto> {
    return this.authService.checkIfEmailRegistered(email);
  }

  @Get('is-authenticated')
  async checkIfAuthenticated(
    @Request() request: FastifyRequest,
  ): Promise<IsAuthenticatedDto> {
    const accessToken = extractTokenFromHeader(request);

    if (!accessToken) return { isAuthenticated: false };

    const { isAuthenticated, isEmailValidated } =
      await this.authService.checkIfAuthenticated(accessToken);

    return { isAuthenticated, isEmailValidated };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AccessTokensDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<AccessTokensDto> {
    return this.authService.signIn(signInDto);
  }

  @Auth(AuthType.JwtCookie)
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  async signOut(@Body() { accessToken, refreshToken }: SignOutDto) {
    return this.authService.signOut(accessToken, refreshToken);
  }
}
