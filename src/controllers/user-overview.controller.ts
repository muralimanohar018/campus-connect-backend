import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { userOverviewService } from '../services/user-overview.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getOverview = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const overview = await userOverviewService.getOverview();

    return ApiResponse.success(
      res,
      'User overview fetched successfully',
      overview,
    );
  },
);