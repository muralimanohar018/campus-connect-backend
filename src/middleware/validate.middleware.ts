import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError';

/**
 * Runs after express-validator chains and forwards a standardized 400
 * AppError with the list of validation issues if any chain failed.
 */
export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: 'path' in e ? e.path : undefined,
      message: e.msg,
    }));
    return next(AppError.badRequest('Validation failed', formatted));
  }

  next();
}
