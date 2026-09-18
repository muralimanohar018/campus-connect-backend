import {
  body,
  param,
  query,
} from 'express-validator';

const roles = [
  'CORE_TEAM',
  'MEMBER',
  'STUDENT',
];

export const announcementIdValidator = [
  param('id')
    .isUUID()
    .withMessage(
      'Invalid announcement id',
    ),
];

export const notificationIdValidator = [
  param('notificationId')
    .isUUID()
    .withMessage(
      'Invalid notification id',
    ),
];

export const announcementListValidator = [
  query('page')
    .optional()
    .isInt({
      min: 1,
    })
    .toInt(),

  query('limit')
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .toInt(),
];

export const notificationListValidator = [
  query('page')
    .optional()
    .isInt({
      min: 1,
    })
    .toInt(),

  query('limit')
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .toInt(),

  query('unreadOnly')
    .optional()
    .isBoolean()
    .toBoolean(),
];

export const createAnnouncementValidator = [
  body('title')
    .trim()
    .notEmpty()
    .isLength({
      max: 200,
    }),

  body('content')
    .trim()
    .notEmpty()
    .isLength({
      max: 10000,
    }),

  body('targetRoles')
    .isArray({
      min: 1,
    }),

  body('targetRoles.*')
    .isIn(roles)
    .withMessage(
      'Invalid announcement target role',
    ),

  body('isPinned')
    .optional()
    .isBoolean()
    .toBoolean(),

  body('isPublished')
    .optional()
    .isBoolean()
    .toBoolean(),
];

export const updateAnnouncementValidator = [
  ...announcementIdValidator,

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .isLength({
      max: 200,
    }),

  body('content')
    .optional()
    .trim()
    .notEmpty()
    .isLength({
      max: 10000,
    }),

  body('targetRoles')
    .optional()
    .isArray({
      min: 1,
    }),

  body('targetRoles.*')
    .optional()
    .isIn(roles),

  body('isPinned')
    .optional()
    .isBoolean()
    .toBoolean(),

  body('isPublished')
    .optional()
    .isBoolean()
    .toBoolean(),
];