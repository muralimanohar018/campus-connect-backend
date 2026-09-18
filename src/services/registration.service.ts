import {
  RegistrationStatus,
  RoleName,
} from '@prisma/client';

import {
  eventRepository,
} from '../repositories/event.repository';

import {
  registrationRepository,
} from '../repositories/registration.repository';

import {
  AppError,
} from '../utils/appError';

export interface RegisterForEventResult {
  id: string;
  eventId: string;
  status: RegistrationStatus;
  registeredAt: Date;
}

function ensureParticipantRole(
  role: RoleName,
) {
  if (
    role !== RoleName.STUDENT &&
    role !== RoleName.MEMBER
  ) {
    throw AppError.forbidden(
      'Only students and members can register for events',
    );
  }
}

export class RegistrationService {
  async register(
    userId: string,
    role: RoleName,
    eventId: string,
  ) {
    ensureParticipantRole(role);

    const event =
      await eventRepository.findById(
        eventId,
      );

    if (!event) {
      throw AppError.notFound(
        'Event not found',
      );
    }

    if (!event.isPublished) {
      throw AppError.badRequest(
        'Registration is not available for this event',
      );
    }

    const now =
      new Date();

    if (
      event.startAt <= now
    ) {
      throw AppError.badRequest(
        'Registration is closed because the event has started',
      );
    }

    if (
      event.registrationDeadline &&
      event.registrationDeadline <= now
    ) {
      throw AppError.badRequest(
        'Registration deadline has passed',
      );
    }

    const existing =
      await registrationRepository.findByUserAndEvent(
        userId,
        eventId,
      );

    if (existing) {
      if (
        existing.status !==
        RegistrationStatus.CANCELLED
      ) {
        throw AppError.conflict(
          'You are already registered for this event',
        );
      }

      const confirmedCount =
        await registrationRepository.countByEvent(
          eventId,
          RegistrationStatus.CONFIRMED,
        );

      const status =
        event.capacity !== null &&
        confirmedCount >= event.capacity
          ? RegistrationStatus.WAITLISTED
          : RegistrationStatus.CONFIRMED;

      return registrationRepository.updateStatus(
        existing.id,
        status,
      );
    }

    const confirmedCount =
      await registrationRepository.countByEvent(
        eventId,
        RegistrationStatus.CONFIRMED,
      );

    const status =
      event.capacity !== null &&
      confirmedCount >= event.capacity
        ? RegistrationStatus.WAITLISTED
        : RegistrationStatus.CONFIRMED;

    return registrationRepository.create({
      user: {
        connect: {
          id: userId,
        },
      },

      event: {
        connect: {
          id: eventId,
        },
      },

      status,
    });
  }

  async cancelOwnRegistration(
    userId: string,
    registrationId: string,
  ) {
    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw AppError.notFound(
        'Registration not found',
      );
    }

    if (
      registration.user.id !== userId
    ) {
      throw AppError.forbidden(
        'You can only cancel your own registration',
      );
    }

    if (
      registration.status ===
      RegistrationStatus.CANCELLED
    ) {
      throw AppError.conflict(
        'Registration is already cancelled',
      );
    }

    if (
      registration.event.startAt <=
      new Date()
    ) {
      throw AppError.badRequest(
        'Registration cannot be cancelled after the event has started',
      );
    }

    return registrationRepository.updateStatus(
      registrationId,
      RegistrationStatus.CANCELLED,
    );
  }

  async listMyRegistrations(
    userId: string,
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

    const skip =
      (page - 1) * limit;

    const [
      registrations,
      total,
    ] = await Promise.all([
      registrationRepository.listByUser(
        userId,
        {
          skip,
          take: limit,
        },
      ),

      registrationRepository.countByUser(
        userId,
      ),
    ]);

    return {
      registrations,

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

  async listEventRegistrations(
    eventId: string,
    input: {
      search?: string;
      status?: RegistrationStatus;
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

    const skip =
      (page - 1) * limit;

    const [
      registrations,
      total,
    ] = await Promise.all([
      registrationRepository.listByEvent(
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

      registrationRepository.countByEvent(
        eventId,
      ),
    ]);

    return {
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
      },

      registrations,

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

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
  ) {
    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw AppError.notFound(
        'Registration not found',
      );
    }

    if (
      registration.status ===
      RegistrationStatus.ATTENDED
    ) {
      throw AppError.badRequest(
        'An attended registration cannot be manually changed',
      );
    }

    if (
      status ===
      RegistrationStatus.ATTENDED
    ) {
      throw AppError.badRequest(
        'ATTENDED is managed by the attendance system',
      );
    }

    if (
      status ===
      RegistrationStatus.CONFIRMED
    ) {
      const event =
        await eventRepository.findById(
          registration.event.id,
        );

      if (!event) {
        throw AppError.notFound(
          'Event not found',
        );
      }

      const confirmedCount =
        await registrationRepository.countByEvent(
          registration.event.id,
          RegistrationStatus.CONFIRMED,
        );

      const isAlreadyConfirmed =
        registration.status ===
        RegistrationStatus.CONFIRMED;

      if (
        event.capacity !== null &&
        confirmedCount >=
          event.capacity &&
        !isAlreadyConfirmed
      ) {
        throw AppError.badRequest(
          'Event capacity has been reached',
        );
      }
    }

    return registrationRepository.updateStatus(
      registrationId,
      status,
    );
  }
}

export const registrationService =
  new RegistrationService();