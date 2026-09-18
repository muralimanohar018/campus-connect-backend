import {
  AttendanceStatus,
  RegistrationStatus,
  RoleName,
} from '@prisma/client';

import {
  attendanceRepository,
} from '../repositories/attendance.repository';

import {
  eventRepository,
} from '../repositories/event.repository';

import {
  registrationRepository,
} from '../repositories/registration.repository';

import {
  AppError,
} from '../utils/appError';

type AttendanceQrType =
  | 'STAFF'
  | 'STUDENT';

function getEventStatus(
  startAt: Date,
  endAt: Date,
) {
  const now = Date.now();

  if (now < startAt.getTime()) {
    return 'UPCOMING' as const;
  }

  if (now < endAt.getTime()) {
    return 'ONGOING' as const;
  }

  return 'COMPLETED' as const;
}

function getQrType(
  event: {
    staffAttendanceQrToken: string | null;
    studentAttendanceQrToken: string | null;
  },
  token: string,
): AttendanceQrType | null {
  if (
    event.staffAttendanceQrToken === token
  ) {
    return 'STAFF';
  }

  if (
    event.studentAttendanceQrToken === token
  ) {
    return 'STUDENT';
  }

  return null;
}

function ensureCanScan(
  role: RoleName,
  qrType: AttendanceQrType,
) {
  if (qrType === 'STAFF') {
    if (
      role !== RoleName.CORE_TEAM &&
      role !== RoleName.MEMBER &&
      role !== RoleName.ADMIN &&
      role !== RoleName.SUPER_ADMIN
    ) {
      throw AppError.forbidden(
        'This QR code is only for club staff attendance',
      );
    }

    return;
  }

  if (qrType === 'STUDENT') {
    if (role !== RoleName.STUDENT) {
      throw AppError.forbidden(
        'This QR code is only for student attendance',
      );
    }
  }
}

export class AttendanceService {
  async scan(
    userId: string,
    role: RoleName,
    qrToken: string,
  ) {
    if (!qrToken?.trim()) {
      throw AppError.badRequest(
        'Attendance QR token is required',
      );
    }

    const event =
      await eventRepository.findByAttendanceQrToken(
        qrToken.trim(),
      );

    if (!event) {
      throw AppError.badRequest(
        'Invalid attendance QR code',
      );
    }

    const qrType =
      getQrType(
        event,
        qrToken.trim(),
      );

    if (!qrType) {
      throw AppError.badRequest(
        'Invalid attendance QR code',
      );
    }

    ensureCanScan(
      role,
      qrType,
    );

    const eventStatus =
      getEventStatus(
        event.startAt,
        event.endAt,
      );

    if (eventStatus !== 'ONGOING') {
      throw AppError.badRequest(
        'Attendance can only be recorded while the event is ongoing',
      );
    }

    if (role === RoleName.STUDENT) {
      const registration =
        await registrationRepository.findByUserAndEvent(
          userId,
          event.id,
        );

      if (
        !registration ||
        (
          registration.status !==
            RegistrationStatus.CONFIRMED &&
          registration.status !==
            RegistrationStatus.ATTENDED
        )
      ) {
        throw AppError.forbidden(
          'You must have a confirmed registration for this event',
        );
      }
    }

    const existing =
      await attendanceRepository.findByUserAndEvent(
        userId,
        event.id,
      );

    if (existing) {
      throw AppError.conflict(
        'Attendance has already been recorded for this event',
      );
    }

    const attendance =
      await attendanceRepository.create({
        user: {
          connect: {
            id: userId,
          },
        },

        event: {
          connect: {
            id: event.id,
          },
        },

        status:
          AttendanceStatus.PRESENT,

        checkInAt:
          new Date(),

        markedBy:
          userId,
      });

    // Attendance is the source of truth for participation. When a
    // participant scans successfully, synchronize their registration
    // so the registration screen immediately becomes ATTENDED.
    const registration =
      await registrationRepository.findByUserAndEvent(
        userId,
        event.id,
      );

    if (registration && role !== RoleName.CORE_TEAM) {
      await registrationRepository.updateStatus(
        registration.id,
        RegistrationStatus.ATTENDED,
      );
    }

    return {
      id: attendance.id,
      eventId: event.id,
      eventTitle: event.title,
      status: attendance.status,
      checkInAt: attendance.checkInAt,
      qrType,
    };
  }

  async listEventAttendance(
    eventId: string,
    input: {
      search?: string;
      status?: AttendanceStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const event =
      await eventRepository.findById(
        eventId,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    // Once the event is over, every confirmed participant who never
    // checked in gets a real ABSENT record. This makes the admin
    // attendance table and per-user attendance stats complete.
    if (event.endAt <= new Date()) {
      await attendanceRepository.ensureAbsentForRegisteredUsers(eventId);
    }

    const page =
      Math.max(
        input.page ?? 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          input.limit ?? 50,
          1,
        ),
        200,
      );

    const skip =
      (page - 1) * limit;

    const [
      attendance,
      total,
    ] = await Promise.all([
      attendanceRepository.listByEvent(
        eventId,
        {
          search:
            input.search,
          status:
            input.status,
          skip,
          take: limit,
        },
      ),

      attendanceRepository.countByEvent(
        eventId,
      ),
    ]);

    return {
      event: {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
      },

      attendance,

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

  async updateAttendance(
    attendanceId: string,
    status: AttendanceStatus,
    markedBy: string,
  ) {
    const attendance =
      await this.findAttendanceById(
        attendanceId,
      );

    if (!attendance) {
      throw AppError.notFound(
        'Attendance record not found',
      );
    }

    if (
      !Object.values(
        AttendanceStatus,
      ).includes(status)
    ) {
      throw AppError.badRequest(
        'Invalid attendance status',
      );
    }

    const updated =
      await attendanceRepository.update(
        attendanceId,
        {
          status,
          markedBy,
          checkInAt:
            status ===
            AttendanceStatus.PRESENT
              ? attendance.checkInAt ??
                new Date()
              : attendance.checkInAt,
        },
      );

    return updated;
  }

  async getOwnEventAttendance(
    userId: string,
    eventId: string,
  ) {
    const event =
      await eventRepository.findById(
        eventId,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    const attendance =
      await attendanceRepository.findByUserAndEvent(
        userId,
        eventId,
      );

    const registration =
      await registrationRepository.findByUserAndEvent(
        userId,
        eventId,
      );

    return {
      event: {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
      },

      registered:
        Boolean(registration),

      attendance: attendance
        ? {
            status:
              attendance.status,
            checkInAt:
              attendance.checkInAt,
          }
        : null,

      label:
        attendance?.status ===
        AttendanceStatus.PRESENT
          ? 'Present'
          : attendance?.status ===
            AttendanceStatus.LATE
            ? 'Late'
            : attendance?.status ===
              AttendanceStatus.EXCUSED
              ? 'Excused'
              : attendance?.status ===
                AttendanceStatus.ABSENT
                ? 'Absent'
                : (registration != null && event.endAt <= new Date())
                    ? 'Absent'
                    : 'Not marked',
    };
  }

  private async findAttendanceById(
    id: string,
  ) {
    return attendanceRepository.findById?.(
      id,
    );
  }
}

export const attendanceService =
  new AttendanceService();