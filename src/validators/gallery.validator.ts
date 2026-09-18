import {
  body,
  param,
  query,
} from 'express-validator';

export const galleryIdValidator = [
  param('id')
    .isUUID()
    .withMessage(
      'Invalid gallery image id',
    ),
];

export const galleryListValidator = [
  query('eventId')
    .optional()
    .isUUID()
    .withMessage(
      'Invalid event id',
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

export const createGalleryValidator = [
  body('imageUrl')
    .isURL()
    .withMessage(
      'imageUrl must be a valid URL',
    ),

  body('caption')
    .optional()
    .trim()
    .isLength({
      max: 500,
    }),

  body('eventId')
    .optional()
    .isUUID()
    .withMessage(
      'Invalid event id',
    ),
];

export const updateGalleryValidator = [
  ...galleryIdValidator,

  body('caption')
    .optional()
    .trim()
    .isLength({
      max: 500,
    }),

  body('eventId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage(
      'Invalid event id',
    ),
];
