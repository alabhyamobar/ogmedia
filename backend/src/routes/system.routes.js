import express from 'express';
import { getHealth, getReadiness, getSystemHealthMetrics } from '../controllers/system.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Public health checks
router.get('/health', getHealth);
router.get('/health/ready', getReadiness);

// Admin system health & queue dashboard
router.get('/api/v1/system/health', authenticate, requireRole(ROLES.ADMIN), getSystemHealthMetrics);

export default router;
