import express from 'express';
import { getAuditLogs } from '../controllers/auditLog.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/', getAuditLogs);

export default router;
