import bcrypt from 'bcrypt';
import crypto from 'crypto';

import {
  RoleName,
} from '@prisma/client';

import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { AppError } from '../utils/appError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  rollNumber?: string;
  department?: string;
}

interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 7;

function getRoleName(
  user: {
    roles: {
      role: {
        name: RoleName;
      };
    } | null;
  },
): RoleName {
  return user.roles?.role.name ?? RoleName.STUDENT;
}

function buildPublicUser(
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    roles: {
      role: {
        name: RoleName;
      };
    } | null;
  },
) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: getRoleName(user),
    avatarUrl: user.avatarUrl,
  };
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing =
      await userRepository.findByEmail(input.email);

    if (existing) {
      throw AppError.conflict(
        'An account with this email already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        input.password,
        SALT_ROUNDS,
      );

    const user =
      await userRepository.create({
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        rollNumber: input.rollNumber,
        department: input.department,
        status: 'ACTIVE',
      });

    const assignedRole =
      await userRepository.assignDefaultRole(
        user.id,
        RoleName.STUDENT,
      );

    if (!assignedRole) {
      throw AppError.internal(
        'Unable to assign default role',
      );
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: RoleName.STUDENT,
    };
  }

  async login(input: LoginInput) {
    const user =
      await userRepository.findByEmail(
        input.email,
      );

    if (!user) {
      throw AppError.unauthorized(
        'Invalid email or password',
      );
    }

    if (
      user.status === 'SUSPENDED' ||
      user.status === 'INACTIVE'
    ) {
      throw AppError.forbidden(
        'Your account is not active',
      );
    }

    const passwordValid =
      await bcrypt.compare(
        input.password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw AppError.unauthorized(
        'Invalid email or password',
      );
    }

    const role =
      getRoleName(user);

    const accessToken =
      signAccessToken({
        userId: user.id,
        email: user.email,
        role,
      });

    const refreshToken =
      signRefreshToken({
        userId: user.id,
        tokenId: crypto.randomUUID(),
      });

    const expiresAt =
      new Date(
        Date.now() +
          REFRESH_TOKEN_TTL_DAYS *
            24 *
            60 *
            60 *
            1000,
      );

    await refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    await userRepository.updateLastLogin(
      user.id,
    );

    return {
      user: buildPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    oldRefreshToken: string,
  ) {
    let decoded;

    try {
      decoded =
        verifyRefreshToken(
          oldRefreshToken,
        );
    } catch {
      throw AppError.unauthorized(
        'Invalid or expired refresh token',
      );
    }

    const stored =
      await refreshTokenRepository.findByToken(
        oldRefreshToken,
      );

    if (
      !stored ||
      stored.revoked ||
      stored.expiresAt <= new Date()
    ) {
      throw AppError.unauthorized(
        'Refresh token has been revoked or expired',
      );
    }

    const user =
      await userRepository.findById(
        decoded.userId,
      );

    if (!user) {
      throw AppError.unauthorized(
        'User no longer exists',
      );
    }

    await refreshTokenRepository.revoke(
      oldRefreshToken,
    );

    const role =
      getRoleName(user);

    const accessToken =
      signAccessToken({
        userId: user.id,
        email: user.email,
        role,
      });

    const newRefreshToken =
      signRefreshToken({
        userId: user.id,
        tokenId: crypto.randomUUID(),
      });

    const expiresAt =
      new Date(
        Date.now() +
          REFRESH_TOKEN_TTL_DAYS *
            24 *
            60 *
            60 *
            1000,
      );

    await refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: buildPublicUser(user),
    };
  }

  async logout(
    refreshToken: string,
  ) {
    const stored =
      await refreshTokenRepository.findByToken(
        refreshToken,
      );

    if (stored) {
      await refreshTokenRepository.revoke(
        refreshToken,
      );
    }

    return true;
  }

  async getProfile(
    userId: string,
  ) {
    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      rollNumber: user.rollNumber,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      status: user.status,
      role: getRoleName(user),
      createdAt: user.createdAt,
    };
  }
}

export const authService =
  new AuthService();