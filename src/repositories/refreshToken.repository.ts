import { prisma } from '../config/database';

export class RefreshTokenRepository {
  create(params: { token: string; userId: string; expiresAt: Date; userAgent?: string; ipAddress?: string }) {
    return prisma.refreshToken.create({ data: params });
  }

  findByToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  revoke(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
