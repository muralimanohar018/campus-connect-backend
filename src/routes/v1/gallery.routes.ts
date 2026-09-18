import {
  Router,
} from 'express';

import * as controller
  from '../../controllers/gallery.controller';

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
  createGalleryValidator,
  galleryIdValidator,
  galleryListValidator,
  updateGalleryValidator,
} from '../../validators/gallery.validator';

const router =
  Router();

router.use(
  authenticate,
);

router.get(
  '/',
  galleryListValidator,
  validateRequest,
  controller.listGallery,
);

router.post(
  '/',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  createGalleryValidator,
  validateRequest,
  controller.addGalleryImage,
);

router.patch(
  '/:id',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
    'CORE_TEAM',
  ),
  updateGalleryValidator,
  validateRequest,
  controller.updateGalleryImage,
);

router.delete(
  '/:id',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
  ),
  galleryIdValidator,
  validateRequest,
  controller.deleteGalleryImage,
);

export default router;