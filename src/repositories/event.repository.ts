import {
  Prisma,
} from '@prisma/client';

import {
  prisma,
} from '../config/database';

export class EventRepository {
  create(
    data: Prisma.EventCreateInput,
  ) {
    return prisma.event.create({
      data,
    });
  }

  findById(id: string) {
    return prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        _count: {
          select: {
            registrations: true,
            attendance: true,
            certificates: true,
          },
        },
      },
    });
  }

  findBySlug(slug: string) {
    return prisma.event.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  findByAttendanceQrToken(
    token: string,
  ) {
    return prisma.event.findFirst({
      where: {
        deletedAt: null,

        OR: [
          {
            staffAttendanceQrToken:
              token,
          },
          {
            studentAttendanceQrToken:
              token,
          },
        ],
      },
    });
  }

  findAll(options: {
    search?: string;
    publishedOnly?: boolean;
    skip: number;
    take: number;
  }) {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,

      ...(options.publishedOnly
        ? {
            isPublished: true,
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                title: {
                  contains:
                    options.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains:
                    options.search,
                  mode: 'insensitive',
                },
              },
              {
                venue: {
                  contains:
                    options.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    return prisma.event.findMany({
      where,

      orderBy: [
        {
          startAt: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],

      skip: options.skip,
      take: options.take,

      include: {
        _count: {
          select: {
            registrations: true,
            attendance: true,
          },
        },
      },
    });
  }

  count(options: {
    search?: string;
    publishedOnly?: boolean;
  }) {
    return prisma.event.count({
      where: {
        deletedAt: null,

        ...(options.publishedOnly
          ? {
              isPublished: true,
            }
          : {}),

        ...(options.search
          ? {
              OR: [
                {
                  title: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
                {
                  venue: {
                    contains:
                      options.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.EventUpdateInput,
  ) {
    return prisma.event.update({
      where: {
        id,
      },
      data,
    });
  }

  softDelete(id: string) {
    return prisma.event.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });
  }

  registrationCount(
    eventId: string,
  ) {
    return prisma.registration.count({
      where: {
        eventId,
        status: {
          in: [
            'PENDING',
            'CONFIRMED',
          ],
        },
      },
    });
  }
}

export const eventRepository =
  new EventRepository();