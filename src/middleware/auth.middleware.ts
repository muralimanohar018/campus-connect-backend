import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { RoleName } from '@prisma/client';

import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest
  extends Request {
  user?: {
    userId: string;
    email: string;
    role: RoleName;
  };
}

/**
 * Verifies the Bearer access token and attaches
 * the authenticated user's single role to req.user.
 */
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header =
    req.headers.authorization;

  if (
    !header ||
    !header.startsWith('Bearer ')
  ) {
    return next(
      AppError.unauthorized(
        'Missing or malformed Authorization header',
      ),
    );
  }

  const token =
    header.substring(7).trim();

  if (!token) {
    return next(
      AppError.unauthorized(
        'Missing access token',
      ),
    );
  }

  try {
    const decoded =
      verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch {
    next(
      AppError.unauthorized(
        'Invalid or expired access token',
      ),
    );
  }
}