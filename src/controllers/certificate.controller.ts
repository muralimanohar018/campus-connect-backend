import { Response } from 'express';

import {
  RoleName,
} from '@prisma/client';

import {
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

import {
  certificateService,
} from '../services/certificate.service';

import {
  ApiResponse,
} from '../utils/apiResponse';

import {
  asyncHandler,
} from '../utils/asyncHandler';

export const issueCertificate =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await certificateService.issue(
          req.user!.role as RoleName,
          req.body,
        );

      return ApiResponse.created(
        res,
        'Certificate issued successfully',
        result,
      );
    },
  );

export const revokeCertificate =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await certificateService.revoke(
          req.user!.role as RoleName,
          req.params.id,
        );

      return ApiResponse.success(
        res,
        'Certificate revoked successfully',
        result,
      );
    },
  );

export const myCertificates =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await certificateService.myCertificates(
          req.user!.userId,
        );

      return ApiResponse.success(
        res,
        'Certificates fetched successfully',
        result,
      );
    },
  );

export const verifyCertificate =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await certificateService.verify(
          req.params.hash,
        );

      return ApiResponse.success(
        res,
        'Certificate verification completed',
        result,
      );
    },
  );