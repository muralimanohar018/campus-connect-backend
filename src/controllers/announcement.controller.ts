import {
  Response,
} from 'express';

import {
  RoleName,
} from '@prisma/client';

import {
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

import {
  announcementService,
} from '../services/announcement.service';

import {
  ApiResponse,
} from '../utils/apiResponse';

import {
  asyncHandler,
} from '../utils/asyncHandler';

export const createAnnouncement =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.create(
          req.user!.userId,
          req.user!.role as RoleName,
          req.body,
        );

      return ApiResponse.created(
        res,
        'Announcement created successfully',
        result,
      );
    },
  );

export const listAdminAnnouncements =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.listForAdmin({
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
        });

      return ApiResponse.success(
        res,
        'Announcements fetched successfully',
        result.announcements,
        result.pagination,
      );
    },
  );

export const listAnnouncements =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.listForUser({
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
        });

      return ApiResponse.success(
        res,
        'Announcements fetched successfully',
        result.announcements,
        result.pagination,
      );
    },
  );

export const getAnnouncement =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const announcement =
        await announcementService.getById(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        'Announcement fetched successfully',
        announcement,
      );
    },
  );

export const updateAnnouncement =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.update(
          req.params.id,
          req.user!.userId,
          req.user!.role as RoleName,
          req.body,
        );

      return ApiResponse.success(
        res,
        'Announcement updated successfully',
        result,
      );
    },
  );

export const deleteAnnouncement =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.delete(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        'Announcement deleted successfully',
        result,
      );
    },
  );

export const listNotifications =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.listNotifications(
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

            unreadOnly:
              req.query.unreadOnly ===
              'true',
          },
        );

      return ApiResponse.success(
        res,
        'Notifications fetched successfully',
        result.notifications,
        result.pagination,
      );
    },
  );

export const markNotificationRead =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.markNotificationRead(
          req.user!.userId,
          req.params.notificationId,
        );

      return ApiResponse.success(
        res,
        'Notification marked as read',
        result,
      );
    },
  );

export const markAllNotificationsRead =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await announcementService.markAllNotificationsRead(
          req.user!.userId,
        );

      return ApiResponse.success(
        res,
        'All notifications marked as read',
        result,
      );
    },
  );