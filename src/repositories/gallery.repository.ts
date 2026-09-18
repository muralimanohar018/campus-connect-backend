import {
  Prisma,
} from '@prisma/client';

import {
  prisma,
} from '../config/database';

export class GalleryRepository {
  create(
    data: Prisma.GalleryCreateInput,
  ) {
    return prisma.gallery.create({
      data,

      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.gallery.findUnique({
      where: {
        id,
      },

      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  findAll(options: {
    eventId?: string;
    page: number;
    limit: number;
  }) {
    const skip =
      (options.page - 1) *
      options.limit;

    return prisma.gallery.findMany({
      where: {
        ...(options.eventId
          ? {
              eventId:
                options.eventId,
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,
      take: options.limit,

      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  count(
    eventId?: string,
  ) {
    return prisma.gallery.count({
      where: {
        ...(eventId
          ? {
              eventId,
            }
          : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.GalleryUpdateInput,
  ) {
    return prisma.gallery.update({
      where: {
        id,
      },

      data,

      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  delete(id: string) {
    return prisma.gallery.delete({
      where: {
        id,
      },
    });
  }
}

export const galleryRepository =
  new GalleryRepository();