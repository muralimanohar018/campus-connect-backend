import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data: T | null;
  pagination: PaginationMeta | null;
  timestamp: string;
}

/**
 * Sends a standardized API response shape across the entire platform:
 * { success, message, data, pagination, timestamp }
 */
export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null,
    pagination: PaginationMeta | null = null
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: statusCode >= 200 && statusCode < 400,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static success<T>(res: Response, message: string, data?: T, pagination?: PaginationMeta): Response {
    return this.send(res, 200, message, data ?? null, pagination ?? null);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.send(res, 201, message, data ?? null);
  }

  static noContent(res: Response, message = 'No content'): Response {
    return this.send(res, 204, message);
  }
}
