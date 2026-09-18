import bcrypt from 'bcrypt';

import {
  userRepository,
} from '../repositories/user.repository';

import {
  AppError,
} from '../utils/appError';

export class ProfileService {
  async get(userId: string) {
    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      rollNumber: user.rollNumber,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.roles?.role.name,
      status: user.status,
    };
  }

  async update(
    userId: string,
    input: {
      fullName?: string;
      phone?: string;
      email?: string;
      avatarUrl?: string;
      bio?: string;
    },
  ) {
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
      input.email &&
      input.email !== user.email
    ) {
      const existing =
        await userRepository.findByEmail(
          input.email,
        );

      if (existing) {
        throw AppError.conflict(
          'Email is already in use',
        );
      }
    }

    return userRepository.updateProfile(
      userId,
      {
        ...(input.fullName !==
        undefined
          ? {
              fullName:
                input.fullName.trim(),
            }
          : {}),

        ...(input.phone !==
        undefined
          ? {
              phone:
                input.phone.trim(),
            }
          : {}),

        ...(input.email !==
        undefined
          ? {
              email:
                input.email.trim().toLowerCase(),
            }
          : {}),

        ...(input.avatarUrl !==
        undefined
          ? {
              avatarUrl:
                input.avatarUrl.trim(),
            }
          : {}),

        ...(input.bio !==
        undefined
          ? {
              bio:
                input.bio.trim(),
            }
          : {}),
      },
    );
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw AppError.notFound(
        'User not found',
      );
    }

    const valid =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );

    if (!valid) {
      throw AppError.unauthorized(
        'Current password is incorrect',
      );
    }

    if (
      newPassword.length < 8
    ) {
      throw AppError.badRequest(
        'New password must contain at least 8 characters',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await userRepository.updateProfile(
      userId,
      {
        passwordHash,
      },
    );

    return {
      passwordChanged: true,
    };
  }
}

export const profileService =
  new ProfileService();