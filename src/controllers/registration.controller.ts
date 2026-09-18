import {
  RegistrationStatus,
  RoleName,
} from '@prisma/client';

import {
  Response,
} from 'express';

import {
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

import {
  registrationService,
} from '../services/registration.service';

import {
  ApiResponse,
} from '../utils/apiResponse';

import {
  asyncHandler,
} from '../utils/asyncHandler';

export const registerForEvent =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await registrationService.register(
          req.user!.userId,
          req.user!.role as RoleName,
          req.params.eventId,
        );

      return ApiResponse.created(
        res,
        'Event registration successful',
        result,
      );
    },
  );

export const cancelRegistration =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await registrationService.cancelOwnRegistration(
          req.user!.userId,
          req.params.registrationId,
        );

      return ApiResponse.success(
        res,
        'Registration cancelled successfully',
        result,
      );
    },
  );

export const listMyRegistrations =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await registrationService.listMyRegistrations(
          req.user!.userId,
          {
            page:
              typeof req.query.page ===
              'string'
                ? Number(
                    req.query.page,
                  )
                : undefined,

            limit:
              typeof req.query.limit ===
              'string'
                ? Number(
                    req.query.limit,
                  )
                : undefined,
          },
        );

      return ApiResponse.success(
        res,
        'Registrations fetched successfully',
        result.registrations,
        result.pagination,
      );
    },
  );

export const listEventRegistrations =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const rawStatus =
        typeof req.query.status ===
        'string'
          ? req.query.status
          : undefined;

      const result =
        await registrationService.listEventRegistrations(
          req.params.eventId,
          {
            search:
              typeof req.query.search ===
              'string'
                ? req.query.search
                : undefined,

            status:
              rawStatus as
                | RegistrationStatus
                | undefined,

            page:
              typeof req.query.page ===
              'string'
                ? Number(
                    req.query.page,
                  )
                : undefined,

            limit:
              typeof req.query.limit ===
              'string'
                ? Number(
                    req.query.limit,
                  )
                : undefined,
          },
        );

      return ApiResponse.success(
        res,
        'Event registrations fetched successfully',
        result.registrations,
        result.pagination,
      );
    },
  );

export const updateRegistrationStatus =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await registrationService.updateStatus(
          req.params.registrationId,
          req.body.status as RegistrationStatus,
        );

      return ApiResponse.success(
        res,
        'Registration status updated successfully',
        result,
      );
    },
  );