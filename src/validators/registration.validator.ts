import {
  body,
  param,
  query,
} from 'express-validator';

const registrationStatuses = [
  'PENDING',
  'CONFIRMED',
  'WAITLISTED',
  'CANCELLED',
];

export const eventRegistrationIdValidator = [
  param('eventId')
    .isUUID()
    .withMessage(
      'Invalid event id',
    ),
];

export const registrationIdValidator = [
  param('registrationId')
    .isUUID()
    .withMessage(
      'Invalid registration id',
    ),
];

export const myRegistrationListValidator = [
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

export const eventRegistrationListValidator = [
  ...eventRegistrationIdValidator,

  query('search')
    .optional()
    .trim()
    .isLength({
      max: 100,
    }),

  query('status')
    .optional()
    .isIn(
      registrationStatuses,
    )
    .withMessage(
      'Invalid registration status',
    ),

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

export const updateRegistrationStatusValidator = [
  ...registrationIdValidator,

  body('status')
    .isIn(
      registrationStatuses,
    )
    .withMessage(
      'Invalid registration status',
    ),
];