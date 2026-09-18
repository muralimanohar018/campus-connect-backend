import {
  Router,
} from 'express';

import * as controller
  from '../../controllers/profile.controller';

import {
  authenticate,
} from '../../middleware/auth.middleware';

import {
  validateRequest,
} from '../../middleware/validate.middleware';

import {
  changePasswordValidator,
  updateProfileValidator,
} from '../../validators/profile.validator';

const router =
  Router();

router.use(
  authenticate,
);

router.get(
  '/',
  controller.getProfile,
);

router.patch(
  '/',
  updateProfileValidator,
  validateRequest,
  controller.updateProfile,
);

router.patch(
  '/password',
  changePasswordValidator,
  validateRequest,
  controller.changePassword,
);

export default router;