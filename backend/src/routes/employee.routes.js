import express from 'express';
import {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  resetEmployeePassword,
  suggestUsername
} from '../controllers/employee.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/', getEmployees);
router.get('/suggest-username', suggestUsername);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.patch('/:id', updateEmployee);
router.post('/:id/reset-password', resetEmployeePassword);

export default router;
