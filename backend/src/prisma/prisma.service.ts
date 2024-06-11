import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const IS_DEBUG_MODE = false;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });

    if (IS_DEBUG_MODE) {
      // @ts-expect-error the types are not provided well by Prisma
      this.$on<any>('query', (event: Prisma.QueryEvent) => {
        this.logger.log('Query: ' + event.query);
        this.logger.log('Duration: ' + event.duration + 'ms');
        this.logger.log('Params: ' + event.params);
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
}
