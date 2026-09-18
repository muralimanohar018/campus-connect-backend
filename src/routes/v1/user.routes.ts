import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import * as userOverviewController from '../../controllers/user-overview.controller';

const router = Router();

/**
 * Organization-wide user and role metrics.
 *
 * SUPER_ADMIN only.
 */
router.get(
  '/overview',
  authenticate,
  authorize('SUPER_ADMIN'),
  userOverviewController.getOverview,
);

export default router;