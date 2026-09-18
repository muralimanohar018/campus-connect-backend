import {
  NotificationType,
  RoleName,
} from '@prisma/client';

import {
  announcementRepository,
} from '../repositories/announcement.repository';

import {
  AppError,
} from '../utils/appError';

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  targetRoles: RoleName[];
  isPinned?: boolean;
  isPublished?: boolean;
}

const ALL_TARGET_ROLES: RoleName[] = [
  RoleName.CORE_TEAM,
  RoleName.MEMBER,
  RoleName.STUDENT,
];

function allowedTargets(
  authorRole: RoleName,
): RoleName[] {
  if (
    authorRole ===
    RoleName.CORE_TEAM
  ) {
    return [
      RoleName.MEMBER,
      RoleName.STUDENT,
    ];
  }

  if (
    authorRole ===
      RoleName.ADMIN ||
    authorRole ===
      RoleName.SUPER_ADMIN
  ) {
    return ALL_TARGET_ROLES;
  }

  return [];
}

function validateTargets(
  authorRole: RoleName,
  targetRoles: RoleName[],
) {
  const allowed =
    allowedTargets(authorRole);

  if (allowed.length === 0) {
    throw AppError.forbidden(
      'You do not have permission to create announcements',
    );
  }

  if (
    targetRoles.length === 0
  ) {
    throw AppError.badRequest(
      'At least one target role is required',
    );
  }

  const uniqueTargets =
    [...new Set(targetRoles)];

  if (
    uniqueTargets.length !==
    targetRoles.length
  ) {
    throw AppError.badRequest(
      'Duplicate target roles are not allowed',
    );
  }

  for (
    const target of uniqueTargets
  ) {
    if (
      !ALL_TARGET_ROLES.includes(
        target,
      ) ||
      !allowed.includes(target)
    ) {
      throw AppError.forbidden(
        `You cannot target the ${target} audience`,
      );
    }
  }
}

async function createAudienceNotifications(
  announcementId: string,
  title: string,
  content: string,
  targetRoles: RoleName[],
) {
  const users =
    await announcementRepository.findTargetUsers(
      targetRoles,
    );

  const notifications =
    users.map((user) => ({
      userId: user.id,
      title,
      message: content,
      type:
        NotificationType.ANNOUNCEMENT,
      isRead: false,
      metadata: {
        announcementId,
      },
    }));

  await announcementRepository.createNotifications(
    notifications,
  );

  return users.length;
}

export class AnnouncementService {
  async create(
    authorId: string,
    authorRole: RoleName,
    input: CreateAnnouncementInput,
  ) {
    if (
      !input.title?.trim()
    ) {
      throw AppError.badRequest(
        'Announcement title is required',
      );
    }

    if (
      !input.content?.trim()
    ) {
      throw AppError.badRequest(
        'Announcement content is required',
      );
    }

    validateTargets(
      authorRole,
      input.targetRoles,
    );

    const publish =
      input.isPublished ??
      true;

    const announcement =
      await announcementRepository.create({
        title:
          input.title.trim(),

        content:
          input.content.trim(),

        author: {
          connect: {
            id: authorId,
          },
        },

        targetRoles: [
          ...new Set(
            input.targetRoles,
          ),
        ],

        isPinned:
          Boolean(input.isPinned),

        isPublished:
          publish,

        publishedAt:
          publish
            ? new Date()
            : undefined,
      });

    let notificationCount = 0;

    if (publish) {
      notificationCount =
        await createAudienceNotifications(
          announcement.id,
          announcement.title,
          announcement.content,
          input.targetRoles,
        );
    }

    return {
      announcement,
      notificationCount,
    };
  }

  async listForAdmin(
    input: {
      page?: number;
      limit?: number;
    },
  ) {
    const page =
      Math.max(
        input.page ?? 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          input.limit ?? 20,
          1,
        ),
        100,
      );

    const [
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.findAll({
        page,
        limit,
        publishedOnly: false,
      }),

      announcementRepository.count({
        publishedOnly: false,
      }),
    ]);

    return {
      announcements,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  }

  async listForUser(
    input: {
      page?: number;
      limit?: number;
    },
  ) {
    const page =
      Math.max(
        input.page ?? 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          input.limit ?? 10,
          1,
        ),
        100,
      );

    const [
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.findAll({
        page,
        limit,
        publishedOnly: true,
      }),

      announcementRepository.count({
        publishedOnly: true,
      }),
    ]);

    return {
      announcements,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  }

  async getById(id: string) {
    const announcement =
      await announcementRepository.findById(
        id,
      );

    if (!announcement) {
      throw AppError.notFound(
        'Announcement not found',
      );
    }

    return announcement;
  }

  async update(
    id: string,
    authorId: string,
    authorRole: RoleName,
    input: {
      title?: string;
      content?: string;
      targetRoles?: RoleName[];
      isPinned?: boolean;
      isPublished?: boolean;
    },
  ) {
    const existing =
      await announcementRepository.findById(
        id,
      );

    if (!existing) {
      throw AppError.notFound(
        'Announcement not found',
      );
    }

    if (
      existing.authorId !==
        authorId &&
      authorRole !==
        RoleName.SUPER_ADMIN
    ) {
      throw AppError.forbidden(
        'You cannot modify this announcement',
      );
    }

    const targetRoles =
      input.targetRoles ??
      existing.targetRoles;

    validateTargets(
      authorRole,
      targetRoles,
    );

    const wasPublished =
      existing.isPublished;

    const isPublished =
      input.isPublished ??
      wasPublished;

    const announcement =
      await announcementRepository.update(
        id,
        {
          ...(input.title !==
          undefined
            ? {
                title:
                  input.title.trim(),
              }
            : {}),

          ...(input.content !==
          undefined
            ? {
                content:
                  input.content.trim(),
              }
            : {}),

          targetRoles,

          ...(input.isPinned !==
          undefined
            ? {
                isPinned:
                  input.isPinned,
              }
            : {}),

          isPublished,

          ...(isPublished &&
          !existing.publishedAt
            ? {
                publishedAt:
                  new Date(),
              }
            : {}),
        },
      );

    if (
      !wasPublished &&
      isPublished
    ) {
      await createAudienceNotifications(
        announcement.id,
        announcement.title,
        announcement.content,
        targetRoles,
      );
    }

    return announcement;
  }

  async delete(
    id: string,
  ) {
    const existing =
      await announcementRepository.findById(
        id,
      );

    if (!existing) {
      throw AppError.notFound(
        'Announcement not found',
      );
    }

    await announcementRepository.softDelete(
      id,
    );

    return {
      id,
      deleted: true,
    };
  }

  async listNotifications(
    userId: string,
    input: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    },
  ) {
    const page =
      Math.max(
        input.page ?? 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          input.limit ?? 20,
          1,
        ),
        100,
      );

    const [
      notifications,
      total,
    ] = await Promise.all([
      announcementRepository.findNotifications(
        userId,
        {
          page,
          limit,
          unreadOnly:
            input.unreadOnly,
        },
      ),

      announcementRepository.notificationCount(
        userId,
        input.unreadOnly,
      ),
    ]);

    return {
      notifications,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  }

  async markNotificationRead(
    userId: string,
    notificationId: string,
  ) {
    const result =
      await announcementRepository.markNotificationRead(
        userId,
        notificationId,
      );

    if (
      result.count === 0
    ) {
      throw AppError.notFound(
        'Notification not found',
      );
    }

    return {
      notificationId,
      isRead: true,
    };
  }

  async markAllNotificationsRead(
    userId: string,
  ) {
    const result =
      await announcementRepository.markAllNotificationsRead(
        userId,
      );

    return {
      updated: result.count,
    };
  }
}

export const announcementService =
  new AnnouncementService();
  