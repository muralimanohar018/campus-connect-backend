import { Router } from 'express';

import * as registrationController
  from '../../controllers/registration.controller';

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
  eventRegistrationIdValidator,
  eventRegistrationListValidator,
  myRegistrationListValidator,
  registrationIdValidator,
  updateRegistrationStatusValidator,
} from '../../validators/registration.validator';

const router = Router();

/**
 * @openapi
 * /registrations/my:
 *   get:
 *     summary: Get my event registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Registrations fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  '/my',
  authenticate,
  myRegistrationListValidator,
  validateRequest,
  registrationController.listMyRegistrations,
);

/**
 * @openapi
 * /registrations/events/{eventId}:
 *   post:
 *     summary: Register for an event
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Event registration successful
 *       400:
 *         description: Registration is not available
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only STUDENT or MEMBER can register
 *       404:
 *         description: Event not found
 *       409:
 *         description: Already registered
 */
router.post(
  '/events/:eventId',
  authenticate,
  authorize(
    'STUDENT',
    'MEMBER',
  ),
  eventRegistrationIdValidator,
  validateRequest,
  registrationController.registerForEvent,
);

/**
 * @openapi
 * /registrations/events/{eventId}:
 *   get:
 *     summary: List registrations for an event
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - CONFIRMED
 *             - WAITLISTED
 *             - CANCELLED
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Event registrations fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Event not found
 */
router.get(
  '/events/:eventId',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  eventRegistrationListValidator,
  validateRequest,
  registrationController.listEventRegistrations,
);

/**
 * @openapi
 * /registrations/{registrationId}/cancel:
 *   patch:
 *     summary: Cancel my registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registration cancelled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You can only cancel your own registration
 *       404:
 *         description: Registration not found
 */
router.patch(
  '/:registrationId/cancel',
  authenticate,
  authorize(
    'STUDENT',
    'MEMBER',
  ),
  registrationIdValidator,
  validateRequest,
  registrationController.cancelRegistration,
);

/**
 * @openapi
 * /registrations/{registrationId}/status:
 *   patch:
 *     summary: Update registration status
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - CONFIRMED
 *                   - WAITLISTED
 *                   - CANCELLED
 *     responses:
 *       200:
 *         description: Registration status updated successfully
 *       400:
 *         description: Invalid registration status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Registration not found
 */
router.patch(
  '/:registrationId/status',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  updateRegistrationStatusValidator,
  validateRequest,
  registrationController.updateRegistrationStatus,
);

export default router;