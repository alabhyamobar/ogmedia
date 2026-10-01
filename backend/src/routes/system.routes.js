import express from 'express';
import {
  getHealth,
  getReadiness,
  getSystemHealthMetrics,
  getSystemErrors,
  clearSystemErrorsHandler,
  triggerTestErrorHandler
} from '../controllers/system.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Public health checks
router.get('/health', getHealth);
router.get('/health/ready', getReadiness);

// Developer-only system health, diagnostics, & error inspection
router.get(
  '/api/v1/system/health',
  authenticate,
  requireRole(ROLES.DEVELOPER),
  getSystemHealthMetrics
);

router.get(
  '/api/v1/system/errors',
  authenticate,
  requireRole(ROLES.DEVELOPER),
  getSystemErrors
);

router.delete(
  '/api/v1/system/errors',
  authenticate,
  requireRole(ROLES.DEVELOPER),
  clearSystemErrorsHandler
);

router.post(
  '/api/v1/system/test-error',
  authenticate,
  requireRole(ROLES.DEVELOPER),
  triggerTestErrorHandler
);

export default router;
