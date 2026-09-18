import { body, param, query } from 'express-validator';

const roleNames = [
  'SUPER_ADMIN',
  'ADMIN',
  'CORE_TEAM',
  'MEMBER',
  'STUDENT',
];

export const listUsersValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  query('role')
    .optional()
    .isIn(roleNames)
    .withMessage('Invalid role'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
];

export const userIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid user id'),
];

export const assignRoleValidator = [
  ...userIdValidator,

  body('role')
    .isIn(roleNames)
    .withMessage('Invalid role'),
];