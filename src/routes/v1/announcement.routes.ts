import {
  Router,
} from 'express';

import * as controller
  from '../../controllers/announcement.controller';

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
  announcementIdValidator,
  announcementListValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
} from '../../validators/announcement.validator';

const router = Router();

/**
 * @openapi
 * /announcements:
 *   get:
 *     summary: Get published announcements
 *     tags: [Announcements]
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
 *         description: Published announcements fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  authenticate,
  announcementListValidator,
  validateRequest,
  controller.listAnnouncements,
);

/**
 * @openapi
 * /announcements/manage:
 *   get:
 *     summary: Get announcements for management
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Management permission required
 */
router.get(
  '/manage',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  announcementListValidator,
  validateRequest,
  controller.listAdminAnnouncements,
);

/**
 * @openapi
 * /announcements:
 *   post:
 *     summary: Create an announcement
 *     tags: [Announcements]
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
 *               - content
 *               - targetRoles
 *             properties:
 *               title:
 *                 type: string
 *                 example: Test Event Reminder
 *               content:
 *                 type: string
 *                 example: CampusConnect test announcement for tomorrow morning at 8:30 AM.
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - CORE_TEAM
 *                     - MEMBER
 *                     - STUDENT
 *                 example:
 *                   - MEMBER
 *                   - STUDENT
 *               isPinned:
 *                 type: boolean
 *                 example: false
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Invalid announcement data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: The current role cannot target the requested audience
 */
router.post(
  '/',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  createAnnouncementValidator,
  validateRequest,
  controller.createAnnouncement,
);

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     summary: Get an announcement
 *     tags: [Announcements]
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
 *         description: Announcement fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Announcement not found
 */
router.get(
  '/:id',
  authenticate,
  announcementIdValidator,
  validateRequest,
  controller.getAnnouncement,
);

/**
 * @openapi
 * /announcements/{id}:
 *   patch:
 *     summary: Update an announcement
 *     tags: [Announcements]
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
 *               content:
 *                 type: string
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - CORE_TEAM
 *                     - MEMBER
 *                     - STUDENT
 *               isPinned:
 *                 type: boolean
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not permitted to modify this announcement
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  updateAnnouncementValidator,
  validateRequest,
  controller.updateAnnouncement,
);

/**
 * @openapi
 * /announcements/{id}:
 *   delete:
 *     summary: Soft delete an announcement
 *     tags: [Announcements]
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
 *         description: Announcement deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Announcement not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  announcementIdValidator,
  validateRequest,
  controller.deleteAnnouncement,
);

export default router;