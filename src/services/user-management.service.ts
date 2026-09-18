import { RoleName } from '@prisma/client';

import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';

const ALL_ROLES: RoleName[] = [
  RoleName.SUPER_ADMIN,
  RoleName.ADMIN,
  RoleName.CORE_TEAM,
  RoleName.MEMBER,
  RoleName.STUDENT,
];

class UserManagementService {
  // ═══════════════════════════════════════════════════════════════
  // LIST USERS
  // ═══════════════════════════════════════════════════════════════

  async listUsers(input: {
    search?: string;
    role?: RoleName;
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

    const skip =
      (page - 1) * limit;

    const [users, total] =
      await Promise.all([
        userRepository.findAll({
          search: input.search,
          role: input.role,
          skip,
          take: limit,
        }),

        userRepository.countAll({
          search: input.search,
          role: input.role,
        }),
      ]);

    return {
      users,

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

  // ═══════════════════════════════════════════════════════════════
  // USER DETAILS
  // ═══════════════════════════════════════════════════════════════

  async getUser(id: string) {
    const user =
      await userRepository.findAdminDetails(
        id,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    return {
      ...user,
      stats: {
        eventsAttended: user._count?.attendanceRecords ?? 0,
        totalEvents: user._count?.registrations ?? 0,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ASSIGN / REPLACE ROLE
  // ═══════════════════════════════════════════════════════════════

  async assignRole(
    userId: string,
    roleName: RoleName,
    requestingUserId: string,
    requestingRole: RoleName,
  ) {
    if (!ALL_ROLES.includes(roleName)) {
      throw AppError.badRequest(
        'Invalid role',
      );
    }

    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    if (
      userId === requestingUserId
    ) {
      throw AppError.forbidden(
        'You cannot change your own role',
      );
    }

    const currentRole =
      user.roles?.role.name;

    if (!currentRole) {
      throw AppError.badRequest(
        'User does not have a valid role',
      );
    }

    if (
      requestingRole === RoleName.ADMIN &&
      (currentRole === RoleName.SUPER_ADMIN ||
        roleName === RoleName.SUPER_ADMIN)
    ) {
      throw AppError.forbidden(
        'ADMIN cannot change a SUPER_ADMIN or assign SUPER_ADMIN',
      );
    }

    if (currentRole === roleName) {
      throw AppError.conflict(
        'User already has this role',
      );
    }

    if (
      currentRole ===
        RoleName.SUPER_ADMIN &&
      roleName !==
        RoleName.SUPER_ADMIN
    ) {
      const superAdminCount =
        await userRepository.countAll({
          role: RoleName.SUPER_ADMIN,
        });

      if (superAdminCount <= 1) {
        throw AppError.badRequest(
          'The last SUPER_ADMIN cannot be demoted',
        );
      }
    }

    const result =
      await userRepository.assignRole(
        userId,
        roleName,
      );

    if (!result) {
      throw AppError.notFound(
        'User or role not found',
      );
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  // SOFT DELETE USER
  // ═══════════════════════════════════════════════════════════════

  async deleteUser(
    userId: string,
    requestingUserId: string,
    requestingRole: RoleName,
  ) {
    if (
      userId === requestingUserId
    ) {
      throw AppError.badRequest(
        'You cannot delete your own account',
      );
    }

    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    if (
      requestingRole === RoleName.ADMIN &&
      user.roles?.role.name === RoleName.SUPER_ADMIN
    ) {
      throw AppError.forbidden(
        'ADMIN cannot delete a SUPER_ADMIN',
      );
    }

    if (
      user.roles?.role.name ===
      RoleName.SUPER_ADMIN
    ) {
      const superAdminCount =
        await userRepository.countAll({
          role: RoleName.SUPER_ADMIN,
        });

      if (superAdminCount <= 1) {
        throw AppError.badRequest(
          'The last SUPER_ADMIN cannot be deleted',
        );
      }
    }

    await userRepository.softDelete(
      userId,
    );

    return {
      id: userId,
      deleted: true,
    };
  }
}

export const userManagementService =
  new UserManagementService();