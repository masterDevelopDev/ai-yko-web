import { UnauthorizedException } from '@nestjs/common';

export class TokenIsNotForGeneralPurposeAccessException extends UnauthorizedException {
  constructor() {
    super('The token you are using cannot perform this action');
  }
}
