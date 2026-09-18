import jwt, {
  SignOptions,
} from 'jsonwebtoken';

import { RoleName } from '@prisma/client';

import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: RoleName;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(
  payload: AccessTokenPayload,
): string {
  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn:
        env.JWT_ACCESS_EXPIRY,
    } as SignOptions,
  );
}

export function signRefreshToken(
  payload: RefreshTokenPayload,
): string {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        env.JWT_REFRESH_EXPIRY,
    } as SignOptions,
  );
}

export function verifyAccessToken(
  token: string,
): AccessTokenPayload {
  return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  ) as AccessTokenPayload;
}

export function verifyRefreshToken(
  token: string,
): RefreshTokenPayload {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
  ) as RefreshTokenPayload;
}