import {
  body,
  param,
} from 'express-validator';

export const certificateIdValidator = [
  param('id')
    .isUUID()
    .withMessage(
      'Invalid certificate id',
    ),
];

export const certificateHashValidator = [
  param('hash')
    .isString()
    .trim()
    .isLength({
      min: 64,
      max: 64,
    })
    .withMessage(
      'Invalid certificate hash',
    ),
];

export const issueCertificateValidator = [
  body('userId')
    .isUUID()
    .withMessage(
      'Invalid user id',
    ),

  body('eventId')
    .optional()
    .isUUID()
    .withMessage(
      'Invalid event id',
    ),

  body('title')
    .trim()
    .notEmpty()
    .isLength({
      max: 200,
    }),

  body('certificateUrl')
    .optional()
    .isURL()
    .withMessage(
      'certificateUrl must be a valid URL',
    ),
];