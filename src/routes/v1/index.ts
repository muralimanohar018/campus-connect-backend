import { Router } from 'express';
import eventRoutes from './event.routes';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import userOverviewRoutes from './user.routes';
import userManagementRoutes from './user-management.routes';
import registrationRoutes from './registration.routes';
import attendanceRoutes from './attendance.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import galleryRoutes from './gallery.routes';

import certificateRoutes from './certificate.routes';
import profileRoutes from './profile.routes';
const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
// Static paths must be mounted before the /:id user route.
router.use('/users', userOverviewRoutes);
router.use('/users', userManagementRoutes);
router.use('/events', eventRoutes);
router.use(
  '/registrations',
  registrationRoutes,
);
router.use(
  '/attendance',
  attendanceRoutes,
);
router.use(
  '/announcements',
  announcementRoutes,
);

router.use(
  '/notifications',
  notificationRoutes,
);
router.use(
  '/gallery',
  galleryRoutes,
);


router.use(
  '/certificates',
  certificateRoutes,
);
router.use(
  '/profile',
  profileRoutes,
);
export default router;
