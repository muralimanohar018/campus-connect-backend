import {
  Prisma,
  RegistrationStatus,
} from '@prisma/client';

import { prisma } from '../config/database';

export class RegistrationRepository {
  findByUserAndEvent(
    userId: string,
    eventId: string,
  ) {
    return prisma.registration.findUnique({
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
            slug: true,
            startAt: true,
            endAt: true,
            isPublished: true,
            capacity: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.registration.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            rollNumber: true,
            department: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            endAt: true,
            capacity: true,
            isPublished: true,
          },
        },
      },
    });
  }

  create(
    data: Prisma.RegistrationCreateInput,
  ) {
    return prisma.registration.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            endAt: true,
            capacity: true,
          },
        },
      },
    });
  }

  updateStatus(
    id: string,
    status: RegistrationStatus,
  ) {
    return prisma.registration.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            rollNumber: true,
            department: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            capacity: true,
          },
        },
      },
    });
  }

  listByUser(
    userId: string,
    options: {
      skip: number;
      take: number;
    },
  ) {
    return prisma.registration.findMany({
      where: {
        userId,
      },

      orderBy: {
        registeredAt: 'desc',
      },

      skip: options.skip,
      take: options.take,

      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            bannerUrl: true,
            venue: true,
            isOnline: true,
            meetingLink: true,
            startAt: true,
            endAt: true,
            registrationDeadline: true,
            capacity: true,
            isPublished: true,
          },
        },
      },
    });
  }

  countByUser(userId: string) {
    return prisma.registration.count({
      where: {
        userId,
      },
    });
  }

  listByEvent(
    eventId: string,
    options: {
      status?: RegistrationStatus;
      search?: string;
      skip: number;
      take: number;
    },
  ) {
    const where: Prisma.RegistrationWhereInput = {
      eventId,

      ...(options.status
        ? {
            status: options.status,
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

    return prisma.registration.findMany({
      where,

      orderBy: [
        {
          registeredAt: 'asc',
        },
      ],

      skip: options.skip,
      take: options.take,

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
          },
        },
      },
    });
  }

  countByEvent(
    eventId: string,
    status?: RegistrationStatus,
  ) {
    return prisma.registration.count({
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

export const registrationRepository =
  new RegistrationRepository();