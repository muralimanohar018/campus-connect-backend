import { Router } from 'express';

import * as authController from '../../controllers/auth.controller';

import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';

import {
  loginValidator,
  refreshTokenValidator,
  registerValidator,
} from '../../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new student account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Test Student
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cc.student@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Student123
 *               rollNumber:
 *                 type: string
 *                 example: CC001
 *               department:
 *                 type: string
 *                 example: ISE
 *     responses:
 *       201:
 *         description: Account created
 */
router.post(
  '/register',
  registerValidator,
  validateRequest,
  authController.register,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cc.student@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Student123
 *     responses:
 *       200:
 *         description: Returns access and refresh tokens
 */
router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login,
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token for a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: New token pair
 */
router.post(
  '/refresh',
  refreshTokenValidator,
  validateRequest,
  authController.refresh,
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post(
  '/logout',
  refreshTokenValidator,
  validateRequest,
  authController.logout,
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get(
  '/me',
  authenticate,
  authController.getProfile,
);

export default router;