import { Role } from '@prisma/client';

export interface ActiveUserData {
  /**
   * The "subject" of the token. The value of this property is the user ID
   * that granted this token.
   */
  sub: string;

  tokenId: string;

  /**
   * The subject's (user) email.
   */
  email: string;

  isGeneralPurposeAccessToken: boolean;

  role: Role;
}
