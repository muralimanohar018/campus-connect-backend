import {
  body,
  param,
  query,
} from 'express-validator';

const attendanceStatuses = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
];

export const attendanceScanValidator = [
  body('qrToken')
    .isString()
    .trim()
    .notEmpty()
    .withMessage(
      'qrToken is required',
    ),
];

export const attendanceEventIdValidator = [
  param('eventId')
    .isUUID()
    .withMessage(
      'Invalid event id',
    ),
];

export const attendanceIdValidator = [
  param('attendanceId')
    .isUUID()
    .withMessage(
      'Invalid attendance id',
    ),
];

export const eventAttendanceListValidator = [
  ...attendanceEventIdValidator,

  query('search')
    .optional()
    .trim()
    .isLength({
      max: 100,
    }),

  query('status')
    .optional()
    .isIn(attendanceStatuses)
    .withMessage(
      'Invalid attendance status',
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
      max: 200,
    })
    .toInt(),
];

export const updateAttendanceValidator = [
  ...attendanceIdValidator,

  body('status')
    .isIn(attendanceStatuses)
    .withMessage(
      'Invalid attendance status',
    ),
];