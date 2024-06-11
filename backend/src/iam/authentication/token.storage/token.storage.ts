import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../redis/redis.constants';

export class InvalidatedTokenError extends Error {}

@Injectable()
export class TokenStorage implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  onApplicationShutdown() {
    return this.redisClient.quit();
  }

  async insert(
    userId: string,
    tokenId: string,
    expirationInSeconds: number,
  ): Promise<void> {
    await this.redisClient.set(
      this.getKey(userId, tokenId),
      1,
      'EX',
      expirationInSeconds,
    );
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const stored = await this.redisClient.get(this.getKey(userId, tokenId));
    if (!stored) {
      return false;
    }
    return true;
  }

  async invalidateKey(userId: string, tokenId: string): Promise<void> {
    await this.redisClient.del(this.getKey(userId, tokenId));
  }

  async invalidateKeys(userId: string) {
    const keys = await this.redisClient.keys(`user-${userId}-*`);

    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }

  private getKey(userId: string, tokenId: string): string {
    return `user-${userId}-${tokenId}`;
  }
}
