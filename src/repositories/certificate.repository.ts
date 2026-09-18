import {
  CertificateStatus,
  Prisma,
} from '@prisma/client';

import { prisma } from '../config/database';

export class CertificateRepository {
  create(
    data: Prisma.CertificateCreateInput,
  ) {
    return prisma.certificate.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.certificate.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findByHash(
    certificateHash: string,
  ) {
    return prisma.certificate.findUnique({
      where: {
        certificateHash,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findByUser(
    userId: string,
  ) {
    return prisma.certificate.findMany({
      where: {
        userId,
      },
      orderBy: {
        issuedAt: 'desc',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  updateStatus(
    id: string,
    status: CertificateStatus,
  ) {
    return prisma.certificate.update({
      where: {
        id,
      },
      data: {
        status,
        revokedAt:
          status ===
          CertificateStatus.REVOKED
            ? new Date()
            : null,
      },
    });
  }
}

export const certificateRepository =
  new CertificateRepository();