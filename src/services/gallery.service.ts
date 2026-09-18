import {
  RoleName,
} from '@prisma/client';

import {
  galleryRepository,
} from '../repositories/gallery.repository';

import {
  AppError,
} from '../utils/appError';

function canUpload(
  role: RoleName,
) {
  return (
    role === RoleName.SUPER_ADMIN ||
    role === RoleName.ADMIN ||
    role === RoleName.CORE_TEAM
  );
}

function canManage(
  role: RoleName,
) {
  return (
    role === RoleName.SUPER_ADMIN ||
    role === RoleName.ADMIN
  );
}

export class GalleryService {
  async list(input: {
    eventId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(
      input.page ?? 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        input.limit ?? 20,
        1,
      ),
      100,
    );

    const [images, total] =
      await Promise.all([
        galleryRepository.findAll({
          eventId: input.eventId,
          page,
          limit,
        }),

        galleryRepository.count(
          input.eventId,
        ),
      ]);

    return {
      images,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit,
        ),
      },
    };
  }

  async addImage(
    userId: string,
    role: RoleName,
    input: {
      imageUrl: string;
      caption?: string;
      eventId?: string;
    },
  ) {
    if (!canUpload(role)) {
      throw AppError.forbidden(
        'You do not have permission to upload gallery images',
      );
    }

    if (!input.imageUrl?.trim()) {
      throw AppError.badRequest(
        'imageUrl is required',
      );
    }

    return galleryRepository.create({
      imageUrl:
        input.imageUrl.trim(),

      caption:
        input.caption?.trim() ||
        undefined,

      eventId:
        input.eventId ||
        undefined,

      uploader: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async updateImage(
    id: string,
    userId: string,
    role: RoleName,
    input: {
      caption?: string;
      eventId?: string | null;
    },
  ) {
    const image =
      await galleryRepository.findById(
        id,
      );

    if (!image) {
      throw AppError.notFound(
        'Gallery image not found',
      );
    }

    if (
      image.uploadedBy !== userId &&
      role !== RoleName.ADMIN &&
      role !== RoleName.SUPER_ADMIN
    ) {
      throw AppError.forbidden(
        'You cannot modify this gallery image',
      );
    }

    return galleryRepository.update(
      id,
      {
        ...(input.caption !==
        undefined
          ? {
              caption:
                input.caption.trim(),
            }
          : {}),

        ...(input.eventId !==
        undefined
          ? {
              eventId:
                input.eventId,
            }
          : {}),
      },
    );
  }

  async deleteImage(
    id: string,
    role: RoleName,
  ) {
    if (!canManage(role)) {
      throw AppError.forbidden(
        'Only ADMIN and SUPER_ADMIN can delete gallery images',
      );
    }

    const image =
      await galleryRepository.findById(
        id,
      );

    if (!image) {
      throw AppError.notFound(
        'Gallery image not found',
      );
    }

    await galleryRepository.delete(id);

    return {
      id,
      deleted: true,
    };
  }
}

export const galleryService =
  new GalleryService();