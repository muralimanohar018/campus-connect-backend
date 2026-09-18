import { prisma } from '../config/database';
import { Prisma, PrismaClient, RoleName } from '@prisma/client';

type TransactionClient = Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$extends'
>;

export class UserRepository {
  // ═══════════════════════════════════════════════════════════════
  // AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════

  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  updateLastLogin(id: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async assignDefaultRole(
    userId: string,
    roleName: RoleName = RoleName.STUDENT,
  ) {
    return prisma.$transaction(async (tx: TransactionClient) => {
      const role = await tx.role.findUnique({
        where: {
          name: roleName,
        },
      });

      if (!role) {
        return null;
      }

      const existing = await tx.userRole.findUnique({
        where: {
          userId,
        },
      });

      if (existing) {
        return tx.userRole.update({
          where: {
            id: existing.id,
          },
          data: {
            roleId: role.id,
            assignedAt: new Date(),
          },
          include: {
            role: true,
          },
        });
      }

      return tx.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
        include: {
          role: true,
        },
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PEOPLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  findAll(
    options: {
      search?: string;
      role?: RoleName;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const {
      search,
      role,
      skip = 0,
      take = 20,
    } = options;

    return prisma.user.findMany({
      where: {
        deletedAt: null,

        ...(search
          ? {
              OR: [
                {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  rollNumber: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),

        ...(role
          ? {
              roles: {
                role: {
                  name: role,
                },
              },
            }
          : {}),
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        rollNumber: true,
        department: true,
        yearOfStudy: true,
        avatarUrl: true,
        bio: true,
        status: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,

        roles: {
          include: {
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,
      take,
    });
  }

  countAll(
    options: {
      search?: string;
      role?: RoleName;
    } = {},
  ) {
    const {
      search,
      role,
    } = options;

    return prisma.user.count({
      where: {
        deletedAt: null,

        ...(search
          ? {
              OR: [
                {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  rollNumber: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),

        ...(role
          ? {
              roles: {
                role: {
                  name: role,
                },
              },
            }
          : {}),
      },
    });
  }

  findAdminDetails(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        rollNumber: true,
        department: true,
        yearOfStudy: true,
        avatarUrl: true,
        bio: true,
        status: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            registrations: true,
            attendanceRecords: true,
          },
        },

        roles: {
          include: {
            role: true,
          },
        },

        registrations: {
          orderBy: {
            registeredAt: 'desc',
          },
          take: 10,
        },

        attendanceRecords: {
          orderBy: {
            checkInAt: 'desc',
          },
          take: 10,
        },

        certificates: {
          orderBy: {
            issuedAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ROLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  async assignRole(
    userId: string,
    roleName: RoleName,
  ) {
    return prisma.$transaction(async (tx: TransactionClient) => {
      const [user, role] = await Promise.all([
        tx.user.findFirst({
          where: {
            id: userId,
            deletedAt: null,
          },
        }),

        tx.role.findUnique({
          where: {
            name: roleName,
          },
        }),
      ]);

      if (!user || !role) {
        return null;
      }

      const existing = await tx.userRole.findUnique({
        where: {
          userId,
        },
      });

      if (!existing) {
        return tx.userRole.create({
          data: {
            userId,
            roleId: role.id,
          },
          include: {
            role: true,
          },
        });
      }

      return tx.userRole.update({
        where: {
          id: existing.id,
        },
        data: {
          roleId: role.id,
          assignedAt: new Date(),
        },
        include: {
          role: true,
        },
      });
    });
  }

  findRole(userId: string) {
    return prisma.userRole.findUnique({
      where: {
        userId,
      },
      include: {
        role: true,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SOFT DELETE
  // ═══════════════════════════════════════════════════════════════

  softDelete(id: string) {
    return prisma.user.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════════════════════════════

  updateProfile(
    id: string,
    data: Prisma.UserUpdateInput,
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }
}

export const userRepository =
  new UserRepository();