import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

/**
 * API version 1 routes.
 *
 * The `/api/v1` prefix is already applied in app.ts through
 * env.API_PREFIX, so we must NOT add another `/v1` here.
 *
 * Final route:
 *
 * /api/v1 + /auth + /login
 * = /api/v1/auth/login
 */
router.use('/', v1Routes);

export default router;