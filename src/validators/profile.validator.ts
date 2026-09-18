import {
  body,
} from 'express-validator';

export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .isLength({
      max: 150,
    }),

  body('phone')
    .optional()
    .trim()
    .isLength({
      max: 30,
    }),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail(),

  body('avatarUrl')
    .optional()
    .isURL(),

  body('bio')
    .optional()
    .trim()
    .isLength({
      max: 1000,
    }),
];

export const changePasswordValidator = [
  body('currentPassword')
    .isString()
    .notEmpty(),

  body('newPassword')
    .isString()
    .isLength({
      min: 8,
      max: 128,
    }),
];