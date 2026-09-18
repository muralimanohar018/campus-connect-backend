import {
  NotificationType,
  Prisma,
  RoleName,
} from '@prisma/client';

import { prisma } from '../config/database';

export class AnnouncementRepository {
  create(
    data: Prisma.AnnouncementCreateInput,
  ) {
    return prisma.announcement.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.announcement.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  findAll(options: {
    page: number;
    limit: number;
    publishedOnly?: boolean;
  }) {
    const skip =
      (options.page - 1) *
      options.limit;

    return prisma.announcement.findMany({
      where: {
        deletedAt: null,

        ...(options.publishedOnly
          ? {
              isPublished: true,
            }
          : {}),
      },

      orderBy: [
        {
          isPinned: 'desc',
        },
        {
          publishedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],

      skip,
      take: options.limit,

      include: {
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  count(options: {
    publishedOnly?: boolean;
  }) {
    return prisma.announcement.count({
      where: {
        deletedAt: null,

        ...(options.publishedOnly
          ? {
              isPublished: true,
            }
          : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.AnnouncementUpdateInput,
  ) {
    return prisma.announcement.update({
      where: {
        id,
      },
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  softDelete(id: string) {
    return prisma.announcement.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });
  }

  async findTargetUsers(
    targetRoles: RoleName[],
  ) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',

        roles: {
          role: {
            name: {
              in: targetRoles,
            },
          },
        },
      },

      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
  }

  createNotifications(
    notifications: Prisma.NotificationCreateManyInput[],
  ) {
    if (
      notifications.length === 0
    ) {
      return Promise.resolve({
        count: 0,
      });
    }

    return prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }

  notificationCount(
    userId: string,
    unreadOnly = false,
  ) {
    return prisma.notification.count({
      where: {
        userId,

        ...(unreadOnly
          ? {
              isRead: false,
            }
          : {}),
      },
    });
  }

  findNotifications(
    userId: string,
    options: {
      page: number;
      limit: number;
      unreadOnly?: boolean;
    },
  ) {
    const skip =
      (options.page - 1) *
      options.limit;

    return prisma.notification.findMany({
      where: {
        userId,

        ...(options.unreadOnly
          ? {
              isRead: false,
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,
      take: options.limit,
    });
  }

  markNotificationRead(
    userId: string,
    notificationId: string,
  ) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  markAllNotificationsRead(
    userId: string,
  ) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}

export const announcementRepository =
  new AnnouncementRepository();