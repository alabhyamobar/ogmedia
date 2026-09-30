import express from 'express';
import {
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  addLeadNote,
  assignLead
} from '../controllers/lead.controller.js';
import { authenticate, requireLeadAccess, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLeads);
router.get('/:id', requireLeadAccess, getLeadById);
router.patch('/:id', requireLeadAccess, updateLead);
router.patch('/:id/status', requireLeadAccess, updateLeadStatus);
router.post('/:id/notes', requireLeadAccess, addLeadNote);
router.patch('/:id/assignment', requireLeadAccess, requireRole(ROLES.ADMIN), assignLead);

export default router;
