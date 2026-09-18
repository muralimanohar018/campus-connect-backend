import crypto from 'crypto';

import {
  CertificateStatus,
  RoleName,
} from '@prisma/client';

import {
  certificateRepository,
} from '../repositories/certificate.repository';

import {
  AppError,
} from '../utils/appError';

function canManage(
  role: RoleName,
) {
  return (
    role === RoleName.ADMIN ||
    role === RoleName.SUPER_ADMIN
  );
}

export class CertificateService {
  async issue(
    role: RoleName,
    input: {
      userId: string;
      eventId?: string;
      title: string;
      certificateUrl?: string;
    },
  ) {
    if (!canManage(role)) {
      throw AppError.forbidden(
        'Only ADMIN and SUPER_ADMIN can issue certificates',
      );
    }

    if (!input.title?.trim()) {
      throw AppError.badRequest(
        'Certificate title is required',
      );
    }

    const certificateHash =
      crypto
        .createHash('sha256')
        .update(
          `${input.userId}:${input.eventId ?? ''}:${input.title}:${crypto.randomUUID()}`,
        )
        .digest('hex');

    return certificateRepository.create({
      title:
        input.title.trim(),

      certificateUrl:
        input.certificateUrl?.trim() ||
        undefined,

      certificateHash,

      user: {
        connect: {
          id: input.userId,
        },
      },

      event: input.eventId
        ? {
            connect: {
              id: input.eventId,
            },
          }
        : undefined,
    });
  }

  async revoke(
    role: RoleName,
    certificateId: string,
  ) {
    if (!canManage(role)) {
      throw AppError.forbidden(
        'Only ADMIN and SUPER_ADMIN can revoke certificates',
      );
    }

    const certificate =
      await certificateRepository.findById(
        certificateId,
      );

    if (!certificate) {
      throw AppError.notFound(
        'Certificate not found',
      );
    }

    if (
      certificate.status ===
      CertificateStatus.REVOKED
    ) {
      throw AppError.conflict(
        'Certificate is already revoked',
      );
    }

    return certificateRepository.updateStatus(
      certificateId,
      CertificateStatus.REVOKED,
    );
  }

  async myCertificates(
    userId: string,
  ) {
    return certificateRepository.findByUser(
      userId,
    );
  }

  async verify(
    hash: string,
  ) {
    const certificate =
      await certificateRepository.findByHash(
        hash,
      );

    if (!certificate) {
      throw AppError.notFound(
        'Certificate not found',
      );
    }

    return {
      valid:
        certificate.status ===
        CertificateStatus.ISSUED,

      certificate,
    };
  }
}

export const certificateService =
  new CertificateService();