import {
  body,
  param,
  query,
} from 'express-validator';

export const eventIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid event id'),
];

export const eventListValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({
      max: 100,
    }),

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

export const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .isLength({
      max: 200,
    })
    .withMessage(
      'Title is required',
    ),

  body('description')
    .optional()
    .trim()
    .isLength({
      max: 5000,
    }),

  body('bannerUrl')
    .optional()
    .isURL()
    .withMessage(
      'bannerUrl must be a valid URL',
    ),

  body('venue')
    .optional()
    .trim()
    .isLength({
      max: 300,
    }),

  body('isOnline')
    .optional()
    .isBoolean()
    .toBoolean(),

  body('meetingLink')
    .optional()
    .isURL()
    .withMessage(
      'meetingLink must be a valid URL',
    ),

  body('startAt')
    .isISO8601()
    .withMessage(
      'startAt must be a valid ISO date',
    ),

  body('endAt')
    .isISO8601()
    .withMessage(
      'endAt must be a valid ISO date',
    ),

  body('registrationDeadline')
    .optional()
    .isISO8601(),

  body('capacity')
    .optional()
    .isInt({
      min: 1,
    })
    .toInt(),
];

export const updateEventValidator = [
  ...eventIdValidator,

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .isLength({
      max: 200,
    }),

  body('description')
    .optional()
    .trim()
    .isLength({
      max: 5000,
    }),

  body('bannerUrl')
    .optional()
    .isURL()
    .withMessage(
      'bannerUrl must be a valid URL',
    ),

  body('venue')
    .optional()
    .trim()
    .isLength({
      max: 300,
    }),

  body('isOnline')
    .optional()
    .isBoolean()
    .toBoolean(),

  body('meetingLink')
    .optional()
    .isURL()
    .withMessage(
      'meetingLink must be a valid URL',
    ),

  body('startAt')
    .optional()
    .isISO8601()
    .withMessage(
      'startAt must be a valid ISO date',
    ),

  body('endAt')
    .optional()
    .isISO8601()
    .withMessage(
      'endAt must be a valid ISO date',
    ),

  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage(
      'registrationDeadline must be a valid ISO date',
    ),

  body('capacity')
    .optional()
    .isInt({
      min: 1,
    })
    .toInt(),

  body('isPublished')
    .optional()
    .isBoolean()
    .toBoolean(),
];