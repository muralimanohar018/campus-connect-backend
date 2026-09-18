import {
  RoleName,
} from '@prisma/client';

import {
  eventRepository,
} from '../repositories/event.repository';

import {
  AppError,
} from '../utils/appError';

import {
  createAttendanceQrToken,
} from '../utils/qr';

import {
  slugify,
} from '../utils/slug';

export type EventStatus =
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED';

export interface CreateEventInput {
  title: string;
  description?: string;
  bannerUrl?: string;
  venue?: string;
  isOnline?: boolean;
  meetingLink?: string;
  startAt: string;
  endAt: string;
  registrationDeadline?: string;
  capacity?: number;
}

export type UpdateEventInput =
  Partial<CreateEventInput> & {
    isPublished?: boolean;
  };

function parseDate(
  value: string | undefined,
  field: string,
): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw AppError.badRequest(
      `${field} must be a valid ISO date`,
    );
  }

  return date;
}

function getStatus(
  startAt: Date,
  endAt: Date,
): EventStatus {
  const now = Date.now();

  if (
    now <
    startAt.getTime()
  ) {
    return 'UPCOMING';
  }

  if (
    now <
    endAt.getTime()
  ) {
    return 'ONGOING';
  }

  return 'COMPLETED';
}

function serializeEvent(
  event: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    bannerUrl: string | null;
    venue: string | null;
    isOnline: boolean;
    meetingLink: string | null;
    startAt: Date;
    endAt: Date;
    registrationDeadline: Date | null;
    capacity: number | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    staffAttendanceQrToken?: string | null;
    studentAttendanceQrToken?: string | null;
    attendanceQrGeneratedAt?: Date | null;
    [key: string]: unknown;
  },
  includeAttendanceQr = false,
) {
  return {
    ...event,

    status: getStatus(
      event.startAt,
      event.endAt,
    ),

    ...(includeAttendanceQr
      ? {
          attendanceQr: {
            staff: event.staffAttendanceQrToken
              ? {
                  token:
                    event.staffAttendanceQrToken,
                }
              : null,

            student:
              event.studentAttendanceQrToken
                ? {
                    token:
                      event.studentAttendanceQrToken,
                  }
                : null,

            generatedAt:
              event.attendanceQrGeneratedAt ??
              null,
          },
        }
      : {
          staffAttendanceQrToken:
            undefined,

          studentAttendanceQrToken:
            undefined,

          attendanceQrGeneratedAt:
            undefined,
        }),
  };
}

async function createUniqueSlug(
  title: string,
): Promise<string> {
  const base =
    slugify(title) ||
    'event';

  let slug = base;
  let suffix = 2;

  while (
    await eventRepository.findBySlug(
      slug,
    )
  ) {
    slug =
      `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function validateTimeWindow(input: {
  startAt: Date;
  endAt: Date;
  registrationDeadline?: Date;
}) {
  if (
    input.endAt <=
    input.startAt
  ) {
    throw AppError.badRequest(
      'End time must be after start time',
    );
  }

  if (
    input.registrationDeadline &&
    input.registrationDeadline >
      input.startAt
  ) {
    throw AppError.badRequest(
      'Registration deadline cannot be after the event start time',
    );
  }
}

function validateCapacity(
  capacity: number | undefined,
) {
  if (
    capacity !== undefined &&
    (
      !Number.isInteger(
        capacity,
      ) ||
      capacity < 1
    )
  ) {
    throw AppError.badRequest(
      'Capacity must be a positive integer',
    );
  }
}

export class EventService {
  async list(input: {
    search?: string;
    page?: number;
    limit?: number;
    role: RoleName;
  }) {
    const page =
      Math.max(
        input.page ?? 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          input.limit ?? 12,
          1,
        ),
        100,
      );

    const skip =
      (page - 1) * limit;

    const publishedOnly =
      input.role !==
        RoleName.ADMIN &&
      input.role !==
        RoleName.SUPER_ADMIN;

    const [
      events,
      total,
    ] = await Promise.all([
      eventRepository.findAll({
        search: input.search,
        publishedOnly,
        skip,
        take: limit,
      }),

      eventRepository.count({
        search: input.search,
        publishedOnly,
      }),
    ]);

    return {
      events:
        events.map((event) =>
          serializeEvent(
            event,
            false,
          ),
        ),

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

  async getById(
    id: string,
    role: RoleName,
  ) {
    const event =
      await eventRepository.findById(
        id,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    if (
      role !==
        RoleName.ADMIN &&
      role !==
        RoleName.SUPER_ADMIN &&
      !event.isPublished
    ) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    const includeAttendanceQr =
      role ===
        RoleName.ADMIN ||
      role ===
        RoleName.SUPER_ADMIN;

    return serializeEvent(
      event,
      includeAttendanceQr,
    );
  }

  async create(
    input: CreateEventInput,
  ) {
    if (
      !input.title?.trim()
    ) {
      throw AppError.badRequest(
        'Event title is required',
      );
    }

    const startAt =
      parseDate(
        input.startAt,
        'startAt',
      );

    const endAt =
      parseDate(
        input.endAt,
        'endAt',
      );

    const registrationDeadline =
      parseDate(
        input.registrationDeadline,
        'registrationDeadline',
      );

    if (
      !startAt ||
      !endAt
    ) {
      throw AppError.badRequest(
        'startAt and endAt are required',
      );
    }

    validateCapacity(
      input.capacity,
    );

    validateTimeWindow({
      startAt,
      endAt,
      registrationDeadline,
    });

    if (
      input.isOnline &&
      !input.meetingLink?.trim()
    ) {
      throw AppError.badRequest(
        'meetingLink is required for online events',
      );
    }

    const staffQrToken =
      createAttendanceQrToken();

    const studentQrToken =
      createAttendanceQrToken();

    const event =
      await eventRepository.create({
        title:
          input.title.trim(),

        slug:
          await createUniqueSlug(
            input.title,
          ),

        description:
          input.description
            ?.trim() ||
          undefined,

        bannerUrl:
          input.bannerUrl
            ?.trim() ||
          undefined,

        venue:
          input.venue?.trim() ||
          undefined,

        isOnline:
          Boolean(
            input.isOnline,
          ),

        meetingLink:
          input.meetingLink
            ?.trim() ||
          undefined,

        startAt,
        endAt,

        registrationDeadline,

        capacity:
          input.capacity,

        isPublished: false,

        staffAttendanceQrToken:
          staffQrToken,

        studentAttendanceQrToken:
          studentQrToken,

        attendanceQrGeneratedAt:
          new Date(),
      });

    return serializeEvent(
      event,
      true,
    );
  }

  async update(
    id: string,
    input: UpdateEventInput,
  ) {
    const existing =
      await eventRepository.findById(
        id,
      );

    if (!existing) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    const startAt =
      parseDate(
        input.startAt,
        'startAt',
      ) ??
      existing.startAt;

    const endAt =
      parseDate(
        input.endAt,
        'endAt',
      ) ??
      existing.endAt;

    const registrationDeadline =
      input.registrationDeadline ===
      undefined
        ? existing.registrationDeadline ??
          undefined
        : parseDate(
            input.registrationDeadline,
            'registrationDeadline',
          );

    validateCapacity(
      input.capacity,
    );

    validateTimeWindow({
      startAt,
      endAt,
      registrationDeadline,
    });

    const isOnline =
      input.isOnline ??
      existing.isOnline;

    const meetingLink =
      input.meetingLink ===
      undefined
        ? existing.meetingLink
        : input.meetingLink;

    if (
      isOnline &&
      !meetingLink?.trim()
    ) {
      throw AppError.badRequest(
        'meetingLink is required for online events',
      );
    }

    if (
      input.capacity !==
      undefined
    ) {
      const registrationCount =
        await eventRepository.registrationCount(
          id,
        );

      if (
        input.capacity <
        registrationCount
      ) {
        throw AppError.badRequest(
          'Capacity cannot be lower than the current registration count',
        );
      }
    }

    const event =
      await eventRepository.update(
        id,
        {
          ...(input.title !==
          undefined
            ? {
                title:
                  input.title.trim(),
              }
            : {}),

          ...(input.description !==
          undefined
            ? {
                description:
                  input.description.trim(),
              }
            : {}),

          ...(input.bannerUrl !==
          undefined
            ? {
                bannerUrl:
                  input.bannerUrl.trim(),
              }
            : {}),

          ...(input.venue !==
          undefined
            ? {
                venue:
                  input.venue.trim(),
              }
            : {}),

          isOnline,

          ...(meetingLink !==
          undefined
            ? {
                meetingLink:
                  meetingLink?.trim() ||
                  null,
              }
            : {}),

          startAt,
          endAt,
          registrationDeadline,

          ...(input.capacity !==
          undefined
            ? {
                capacity:
                  input.capacity,
              }
            : {}),

          ...(input.isPublished !==
          undefined
            ? {
                isPublished:
                  input.isPublished,
              }
            : {}),
        },
      );

    return serializeEvent(
      event,
      true,
    );
  }

    async getAttendanceQr(
    id: string,
    role: RoleName,
  ) {
    const event =
      await eventRepository.findById(id);

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    if (
      !event.staffAttendanceQrToken ||
      !event.studentAttendanceQrToken
    ) {
      throw AppError.internal(
        'Attendance QR codes have not been generated for this event',
      );
    }

    const response = {
      eventId: event.id,
      eventTitle: event.title,
      staffQrToken: null as string | null,
      studentQrToken: null as string | null,
      generatedAt: event.attendanceQrGeneratedAt,
    };

    if (role === RoleName.SUPER_ADMIN || role === RoleName.ADMIN) {
      response.staffQrToken = event.staffAttendanceQrToken;
      response.studentQrToken = event.studentAttendanceQrToken;
    } else if (role === RoleName.CORE_TEAM) {
      // Core Team displays the student QR but never receives the staff QR.
      response.studentQrToken = event.studentAttendanceQrToken;
    } else {
      throw AppError.forbidden(
        'Only ADMIN, SUPER_ADMIN or CORE_TEAM can display attendance QRs',
      );
    }

    return response;
  }

  async publish(
    id: string,
  ) {
    const event =
      await eventRepository.findById(
        id,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    if (
      getStatus(
        event.startAt,
        event.endAt,
      ) === 'COMPLETED'
    ) {
      throw AppError.badRequest(
        'Completed events cannot be published',
      );
    }

    return serializeEvent(
      await eventRepository.update(
        id,
        {
          isPublished: true,
        },
      ),
      true,
    );
  }

  async delete(
    id: string,
  ) {
    const event =
      await eventRepository.findById(
        id,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    await eventRepository.softDelete(
      id,
    );

    return {
      id,
      deleted: true,
    };
  }
}

export const eventService =
  new EventService();