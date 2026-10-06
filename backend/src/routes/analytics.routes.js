import express from 'express';
import {
  getOverviewAnalytics,
  getServiceAnalytics,
  getEmployeeAnalytics,
  getTimelineAnalytics
} from '../controllers/analytics.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', getOverviewAnalytics);
router.get('/services', getServiceAnalytics);
router.get('/timeline', getTimelineAnalytics);
router.get('/employees', requireRole(ROLES.ADMIN, ROLES.DEVELOPER), getEmployeeAnalytics);

export default router;
