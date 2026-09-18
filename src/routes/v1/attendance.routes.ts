import { Router } from 'express';

import * as attendanceController
  from '../../controllers/attendance.controller';

import {
  authenticate,
} from '../../middleware/auth.middleware';

import {
  authorize,
} from '../../middleware/rbac.middleware';

import {
  validateRequest,
} from '../../middleware/validate.middleware';

import {
  attendanceEventIdValidator,
  attendanceIdValidator,
  attendanceScanValidator,
  eventAttendanceListValidator,
  updateAttendanceValidator,
} from '../../validators/attendance.validator';

const router = Router();

router.use(authenticate);

// ---------------------------------------------------------------
// SCAN ATTENDANCE QR
// ---------------------------------------------------------------

router.post(
  '/scan',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
    'MEMBER',
    'STUDENT',
  ),
  attendanceScanValidator,
  validateRequest,
  attendanceController.scanAttendance,
);

// ---------------------------------------------------------------
// OWN ATTENDANCE FOR AN EVENT
// ---------------------------------------------------------------

router.get(
  '/events/:eventId/me',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
    'MEMBER',
    'STUDENT',
  ),
  attendanceEventIdValidator,
  validateRequest,
  attendanceController.getOwnEventAttendance,
);

// ---------------------------------------------------------------
// ALL ATTENDANCE FOR AN EVENT
// ADMIN / SUPER_ADMIN ONLY
// ---------------------------------------------------------------

router.get(
  '/events/:eventId',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
  ),
  eventAttendanceListValidator,
  validateRequest,
  attendanceController.listEventAttendance,
);

// ---------------------------------------------------------------
// CORRECT ATTENDANCE
// ADMIN / SUPER_ADMIN ONLY
// ---------------------------------------------------------------

router.patch(
  '/:attendanceId',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
  ),
  updateAttendanceValidator,
  validateRequest,
  attendanceController.updateAttendance,
);

export default router;