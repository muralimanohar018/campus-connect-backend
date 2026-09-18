import { RoleName } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Organization-level user metrics.
 *
 * Used by the SUPER_ADMIN workspace.
 *
 * Role counts are independent because a user may hold
 * more than one role.
 */
class UserOverviewService {
  async getOverview() {
    const activeUserWhere = {
      deletedAt: null,
    } as const;

    const [
      totalUsers,
      superAdmins,
      admins,
      coreTeam,
      members,
      students,
      events,
      registrations,
      attendance,
      certificates,
      announcements,
      notifications,
      galleryItems,
      auditLogs,
    ] = await Promise.all([
      prisma.user.count({
        where: activeUserWhere,
      }),

      this.countByRole(RoleName.SUPER_ADMIN),

      this.countByRole(RoleName.ADMIN),

      this.countByRole(RoleName.CORE_TEAM),

      this.countByRole(RoleName.MEMBER),

      this.countByRole(RoleName.STUDENT),

      prisma.event.count({ where: { deletedAt: null } }),
      prisma.registration.count(),
      prisma.attendance.count(),
      prisma.certificate.count(),
      prisma.announcement.count({ where: { deletedAt: null } }),
      prisma.notification.count(),
      prisma.gallery.count(),
      prisma.auditLog.count(),
    ]);

    return {
      totalUsers,

      roles: {
        SUPER_ADMIN: superAdmins,
        ADMIN: admins,
        CORE_TEAM: coreTeam,
        MEMBER: members,
        STUDENT: students,
      },
      platform: {
        events,
        registrations,
        attendance,
        certificates,
        announcements,
        notifications,
        galleryItems,
        auditLogs,
      },
    };
  }

  private countByRole(role: RoleName) {
    return prisma.userRole.count({
      where: {
        role: {
          name: role,
        },
        user: {
          deletedAt: null,
        },
      },
    });
  }
}

export const userOverviewService = new UserOverviewService();
