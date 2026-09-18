import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check including DB connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let dbStatus = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    return ApiResponse.success(res, 'Service is healthy', {
      uptime: process.uptime(),
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
