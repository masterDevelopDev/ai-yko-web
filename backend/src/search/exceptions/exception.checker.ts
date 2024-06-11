import { Prisma } from '@prisma/client';

export class ExceptionChecker {
  static IS_FOREIGN_KEY_EXCEPTION(e: Error): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003'
    );
  }
  static IS_RECORD_NOT_EXISTING_EXCEPTION(e: Error): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
    );
  }
}
