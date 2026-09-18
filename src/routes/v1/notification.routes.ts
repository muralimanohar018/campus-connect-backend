import {
  Router,
} from 'express';

import * as controller
  from '../../controllers/announcement.controller';

import {
  authenticate,
} from '../../middleware/auth.middleware';

import {
  validateRequest,
} from '../../middleware/validate.middleware';

import {
  notificationIdValidator,
  notificationListValidator,
} from '../../validators/announcement.validator';

const router = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
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
 *           default: 20
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  authenticate,
  notificationListValidator,
  validateRequest,
  controller.listNotifications,
);

/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/:notificationId/read',
  authenticate,
  notificationIdValidator,
  validateRequest,
  controller.markNotificationRead,
);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Authentication required
 */
router.patch(
  '/read-all',
  authenticate,
  controller.markAllNotificationsRead,
);

export default router;