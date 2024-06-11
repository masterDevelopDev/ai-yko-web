import { FastifyRequest } from 'fastify';

export const extractTokenFromHeader = (
  request: FastifyRequest,
): string | undefined => {
  const [, token] = request.headers.authorization?.split(' ') ?? [];
  return token;
};
