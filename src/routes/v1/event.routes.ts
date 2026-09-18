import { Router } from 'express';

import * as eventController from '../../controllers/event.controller';

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
  createEventValidator,
  eventIdValidator,
  eventListValidator,
  updateEventValidator,
} from '../../validators/event.validator';

const router = Router();

/**
 * @openapi
 * /events:
 *   get:
 *     summary: List events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by title, description or venue
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
 *           default: 12
 *     responses:
 *       200:
 *         description: Events fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  authenticate,
  eventListValidator,
  validateRequest,
  eventController.listEvents,
);

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startAt
 *               - endAt
 *             properties:
 *               title:
 *                 type: string
 *                 example: CampusConnect Hackathon
 *               description:
 *                 type: string
 *                 example: Annual coding club hackathon
 *               bannerUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/banner.jpg
 *               venue:
 *                 type: string
 *                 example: Sir MVIT Auditorium
 *               isOnline:
 *                 type: boolean
 *                 example: false
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *                 example: https://meet.google.com/example
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-17T09:00:00.000Z
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-17T17:00:00.000Z
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-16T23:59:00.000Z
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 */
router.post(
  '/',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  createEventValidator,
  validateRequest,
  eventController.createEvent,
);

/**
 * @openapi
 * /events/{id}/attendance-qr:
 *   get:
 *     summary: Get permanent attendance QR tokens
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Attendance QR tokens fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Event not found
 */
router.get(
  '/:id/attendance-qr',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  eventIdValidator,
  validateRequest,
  eventController.getAttendanceQr,
);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Event not found
 */
router.get(
  '/:id',
  authenticate,
  eventIdValidator,
  validateRequest,
  eventController.getEvent,
);

/**
 * @openapi
 * /events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               venue:
 *                 type: string
 *               isOnline:
 *                 type: boolean
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  updateEventValidator,
  validateRequest,
  eventController.updateEvent,
);

/**
 * @openapi
 * /events/{id}/publish:
 *   post:
 *     summary: Publish an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event published successfully
 *       400:
 *         description: Event cannot be published
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Event not found
 */
router.post(
  '/:id/publish',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  eventIdValidator,
  validateRequest,
  eventController.publishEvent,
);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Soft delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN or SUPER_ADMIN required
 *       404:
 *         description: Event not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  eventIdValidator,
  validateRequest,
  eventController.deleteEvent,
);

export default router;