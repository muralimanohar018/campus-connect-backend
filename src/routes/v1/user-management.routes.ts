import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as userManagementController from '../../controllers/user-management.controller';
import {
  assignRoleValidator,
  listUsersValidator,
  userIdValidator,
} from '../../validators/user-management.validator';

const router = Router();

/**
 * SUPER_ADMIN People Management
 *
 * Every endpoint is protected at the backend.
 */
router.use(
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
);

router.get(
  '/',
  listUsersValidator,
  validateRequest,
  userManagementController.listUsers,
);

router.get(
  '/:id',
  userIdValidator,
  validateRequest,
  userManagementController.getUser,
);

router.put(
  '/:id/role',
  assignRoleValidator,
  validateRequest,
  userManagementController.assignRole,
);

router.delete(
  '/:id',
  userIdValidator,
  validateRequest,
  userManagementController.deleteUser,
);

export default router;