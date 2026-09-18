import {
  Router,
} from 'express';

import * as controller
  from '../../controllers/certificate.controller';

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
  certificateHashValidator,
  certificateIdValidator,
  issueCertificateValidator,
} from '../../validators/certificate.validator';

const router =
  Router();

router.get(
  '/verify/:hash',
  authenticate,
  certificateHashValidator,
  validateRequest,
  controller.verifyCertificate,
);

router.use(
  authenticate,
);

router.get(
  '/my',
  controller.myCertificates,
);

router.post(
  '/',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
  ),
  issueCertificateValidator,
  validateRequest,
  controller.issueCertificate,
);

router.patch(
  '/:id/revoke',
  authorize(
    'SUPER_ADMIN',
    'ADMIN',
  ),
  certificateIdValidator,
  validateRequest,
  controller.revokeCertificate,
);

export default router;