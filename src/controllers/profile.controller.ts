import {
  Response,
} from 'express';

import {
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

import {
  profileService,
} from '../services/profile.service';

import {
  ApiResponse,
} from '../utils/apiResponse';

import {
  asyncHandler,
} from '../utils/asyncHandler';

export const getProfile =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await profileService.get(
          req.user!.userId,
        );

      return ApiResponse.success(
        res,
        'Profile fetched successfully',
        result,
      );
    },
  );

export const updateProfile =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await profileService.update(
          req.user!.userId,
          req.body,
        );

      return ApiResponse.success(
        res,
        'Profile updated successfully',
        result,
      );
    },
  );

export const changePassword =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await profileService.changePassword(
          req.user!.userId,
          req.body.currentPassword,
          req.body.newPassword,
        );

      return ApiResponse.success(
        res,
        'Password changed successfully',
        result,
      );
    },
  );