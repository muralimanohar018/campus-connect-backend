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
  galleryService,
} from '../services/gallery.service';

import {
  ApiResponse,
} from '../utils/apiResponse';

import {
  asyncHandler,
} from '../utils/asyncHandler';

export const listGallery =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await galleryService.list({
          eventId:
            typeof req.query.eventId ===
            'string'
              ? req.query.eventId
              : undefined,

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
        'Gallery fetched successfully',
        result.images,
        result.pagination,
      );
    },
  );

export const addGalleryImage =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await galleryService.addImage(
          req.user!.userId,
          req.user!.role as RoleName,
          req.body,
        );

      return ApiResponse.created(
        res,
        'Gallery image added successfully',
        result,
      );
    },
  );

export const updateGalleryImage =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await galleryService.updateImage(
          req.params.id,
          req.user!.userId,
          req.user!.role as RoleName,
          req.body,
        );

      return ApiResponse.success(
        res,
        'Gallery image updated successfully',
        result,
      );
    },
  );

export const deleteGalleryImage =
  asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
    ) => {
      const result =
        await galleryService.deleteImage(
          req.params.id,
          req.user!.role as RoleName,
        );

      return ApiResponse.success(
        res,
        'Gallery image deleted successfully',
        result,
      );
    },
  );