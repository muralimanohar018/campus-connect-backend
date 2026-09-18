import {
  AttendanceStatus,
  Prisma,
  RegistrationStatus,
} from '@prisma/client';

import {
  prisma,
} from '../config/database';

export class AttendanceRepository {
  findById(id: string) {
    return prisma.attendance.findUnique({
      where: {
        id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            rollNumber: true,
          },
        },
      },
    });
  }

  findByUserAndEvent(
    userId: string,
    eventId: string,
  ) {
    return prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },

      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });
  }

  create(
    data: Prisma.AttendanceCreateInput,
  ) {
    return prisma.attendance.create({
      data,

      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });
  }

  update(
    id: string,
    data: Prisma.AttendanceUpdateInput,
  ) {
    return prisma.attendance.update({
      where: {
        id,
      },

      data,

      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });
  }


  async ensureAbsentForRegisteredUsers(eventId: string) {
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: {
          in: [RegistrationStatus.CONFIRMED, RegistrationStatus.ATTENDED],
        },
      },
      select: { userId: true },
    });

    if (registrations.length === 0) return;

    await prisma.attendance.createMany({
      data: registrations.map(({ userId }) => ({
        userId,
        eventId,
        status: AttendanceStatus.ABSENT,
      })),
      skipDuplicates: true,
    });
  }

  listByEvent(
    eventId: string,
    options: {
      search?: string;
      status?: AttendanceStatus;
      skip: number;
      take: number;
    },
  ) {
    const where:
      Prisma.AttendanceWhereInput = {
      eventId,

      ...(options.status
        ? {
            status:
              options.status,
          }
        : {}),

      ...(options.search
        ? {
            user: {
              OR: [
                {
                  fullName: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
                {
                  rollNumber: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }
        : {}),
    };

    return prisma.attendance.findMany({
      where,

      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          user: {
            fullName:
              'asc',
          },
        },
      ],

      skip:
        options.skip,

      take:
        options.take,

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            rollNumber: true,
            department: true,
            yearOfStudy: true,
            avatarUrl: true,

            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  countByEvent(
    eventId: string,
    status?: AttendanceStatus,
  ) {
    return prisma.attendance.count({
      where: {
        eventId,

        ...(status
          ? {
              status,
            }
          : {}),
      },
    });
  }
}

export const attendanceRepository =
  new AttendanceRepository();