import {
  NextFunction,
  Response,
} from 'express';

import { AppError } from '../utils/appError';
import {
  AuthenticatedRequest,
} from './auth.middleware';

/**
 * Allows the request when the authenticated user's
 * single role matches one of the permitted roles.
 */
export function authorize(
  ...allowedRoles: string[]
) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(
          'Authentication required',
        ),
      );
    }

    const hasRole =
      allowedRoles.includes(
        req.user.role,
      );

    if (!hasRole) {
      return next(
        AppError.forbidden(
          'You do not have permission to perform this action',
        ),
      );
    }

    next();
  };
}