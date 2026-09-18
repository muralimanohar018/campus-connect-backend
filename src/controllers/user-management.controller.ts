import { Response } from 'express';
import { RoleName } from '@prisma/client';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { userManagementService } from '../services/user-management.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const page = req.query.page;
    const limit = req.query.limit;

    const result =
      await userManagementService.listUsers({
        search:
          typeof req.query.search === 'string'
            ? req.query.search
            : undefined,

        role:
          typeof req.query.role === 'string'
            ? (req.query.role as RoleName)
            : undefined,

        page:
          typeof page === 'number'
            ? page
            : typeof page === 'string'
              ? Number(page)
              : undefined,

        limit:
          typeof limit === 'number'
            ? limit
            : typeof limit === 'string'
              ? Number(limit)
              : undefined,
      });

    return ApiResponse.success(
      res,
      'Users fetched successfully',
      result.users,
      result.pagination,
    );
  },
);

export const getUser = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user =
      await userManagementService.getUser(
        req.params.id,
      );

    return ApiResponse.success(
      res,
      'User details fetched successfully',
      user,
    );
  },
);

export const assignRole = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await userManagementService.assignRole(
        req.params.id,
        req.body.role as RoleName,
        req.user!.userId,
        req.user!.role as RoleName,
      );

    return ApiResponse.success(
      res,
      'Role assigned successfully',
      result,
    );
  },
);

export const deleteUser = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const result =
      await userManagementService.deleteUser(
        req.params.id,
        req.user!.userId,
        req.user!.role as RoleName,
      );

    return ApiResponse.success(
      res,
      'User deleted successfully',
      result,
    );
  },
);