import { Response } from 'express';
import { RoleName } from '@prisma/client';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { eventService } from '../services/event.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const listEvents = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result = await eventService.list({
      search:
        typeof req.query.search === 'string'
          ? req.query.search
          : undefined,

      page:
        typeof req.query.page === 'string'
          ? Number(req.query.page)
          : undefined,

      limit:
        typeof req.query.limit === 'string'
          ? Number(req.query.limit)
          : undefined,

      role: req.user!.role as RoleName,
    });

    return ApiResponse.success(
      res,
      'Events fetched successfully',
      result.events,
      result.pagination,
    );
  },
);

export const getEvent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const event = await eventService.getById(
      req.params.id,
      req.user!.role as RoleName,
    );

    return ApiResponse.success(
      res,
      'Event fetched successfully',
      event,
    );
  },
);

export const getAttendanceQr = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await eventService.getAttendanceQr(
        req.params.id,
        req.user!.role as RoleName,
      );

    return ApiResponse.success(
      res,
      'Attendance QR codes fetched successfully',
      result,
    );
  },
);

export const createEvent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const event = await eventService.create(
      req.body,
    );

    return ApiResponse.created(
      res,
      'Event created successfully',
      event,
    );
  },
);

export const updateEvent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const event = await eventService.update(
      req.params.id,
      req.body,
    );

    return ApiResponse.success(
      res,
      'Event updated successfully',
      event,
    );
  },
);

export const publishEvent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const event = await eventService.publish(
      req.params.id,
    );

    return ApiResponse.success(
      res,
      'Event published successfully',
      event,
    );
  },
);

export const deleteEvent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result = await eventService.delete(
      req.params.id,
    );

    return ApiResponse.success(
      res,
      'Event deleted successfully',
      result,
    );
  },
);