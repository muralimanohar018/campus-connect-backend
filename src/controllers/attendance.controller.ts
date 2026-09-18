import {
  AttendanceStatus,
  RoleName,
} from '@prisma/client';

import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { attendanceService } from '../services/attendance.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const scanAttendance = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await attendanceService.scan(
        req.user!.userId,
        req.user!.role as RoleName,
        req.body.qrToken,
      );

    return ApiResponse.success(
      res,
      'Attendance marked successfully',
      result,
    );
  },
);

export const listEventAttendance = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const rawStatus =
      typeof req.query.status === 'string'
        ? req.query.status
        : undefined;

    const result =
      await attendanceService.listEventAttendance(
        req.params.eventId,
        {
          search:
            typeof req.query.search === 'string'
              ? req.query.search
              : undefined,

          status:
            rawStatus as
              | AttendanceStatus
              | undefined,

          page:
            typeof req.query.page === 'string'
              ? Number(req.query.page)
              : undefined,

          limit:
            typeof req.query.limit === 'string'
              ? Number(req.query.limit)
              : undefined,
        },
      );

    return ApiResponse.success(
      res,
      'Event attendance fetched successfully',
      result.attendance,
      result.pagination,
    );
  },
);

export const updateAttendance = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await attendanceService.updateAttendance(
        req.params.attendanceId,
        req.body.status as AttendanceStatus,
        req.user!.userId,
      );

    return ApiResponse.success(
      res,
      'Attendance updated successfully',
      result,
    );
  },
);

export const getOwnEventAttendance = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await attendanceService.getOwnEventAttendance(
        req.user!.userId,
        req.params.eventId,
      );

    return ApiResponse.success(
      res,
      'Attendance status fetched successfully',
      result,
    );
  },
);