import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');

  const roleDefinitions: {
    name: RoleName;
    description: string;
  }[] = [
    {
      name: RoleName.SUPER_ADMIN,
      description:
        'Full unrestricted access to the platform',
    },
    {
      name: RoleName.ADMIN,
      description:
        'Manages club operations, events and members',
    },
    {
      name: RoleName.CORE_TEAM,
      description:
        'Core committee member with elevated permissions',
    },
    {
      name: RoleName.MEMBER,
      description:
        'Registered club member',
    },
    {
      name: RoleName.STUDENT,
      description:
        'Default role for newly registered students',
    },
  ];

  for (const role of roleDefinitions) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },

      update: {},

      create: role,
    });
  }

  console.log('Seeding super admin user...');

  const passwordHash =
    await bcrypt.hash(
      'ChangeMe@123',
      10,
    );

  const superAdmin =
    await prisma.user.upsert({
      where: {
        email: 'admin@campusconnect.dev',
      },

      update: {},

      create: {
        fullName:
          'Campus Connect Admin',
        email:
          'admin@campusconnect.dev',
        passwordHash,
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

  const superAdminRole =
    await prisma.role.findUnique({
      where: {
        name: RoleName.SUPER_ADMIN,
      },
    });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId: superAdmin.id,
      },

      update: {
        roleId: superAdminRole.id,
        assignedAt: new Date(),
      },

      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });