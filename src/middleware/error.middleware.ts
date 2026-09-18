import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

/**
 * Catches unmatched routes and forwards a standardized 404 AppError.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Global error handler. Converts any thrown error (AppError, Prisma errors,
 * validation errors, or unexpected exceptions) into the standard API
 * response shape: { success, message, data, pagination, timestamp }.
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === 'P2002') {
      message = `A record with this ${(err.meta?.target as string[])?.join(', ') || 'value'} already exists`;
      statusCode = 409;
    } else if (err.code === 'P2025') {
      message = 'Record not found';
      statusCode = 404;
    } else {
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = isProduction ? 'Internal server error' : err.message;
  }

  if (statusCode >= 500) {
    logger.error(message, { error: err });
  } else {
    logger.warn(message, { statusCode });
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    pagination: null,
    ...(details ? { errors: details } : {}),
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString(),
  });
}
