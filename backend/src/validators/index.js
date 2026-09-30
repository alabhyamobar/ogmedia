import { z } from 'zod';
import { SERVICES, LABEL_TO_SERVICE, ROLES, LEAD_STATUS } from '../constants/index.js';

// Helper to normalize service input (accepts both enum keys and friendly labels)
const serviceEnumValues = Object.values(SERVICES);

export const contactLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name cannot exceed 120 characters'),
  email: z.string().trim().email('Invalid email address').max(150),
  phone: z.string().trim().max(30).optional().default(''),
  company: z.string().trim().max(150).optional().default(''),
  service: z.string().transform((val) => {
    // If it's directly a valid enum value, return it
    if (serviceEnumValues.includes(val)) return val;
    // If it matches a friendly label, map it
    if (LABEL_TO_SERVICE[val]) return LABEL_TO_SERVICE[val];
    // If it's a comma-separated list or array from frontend multi-select, take first or map
    if (typeof val === 'string' && val.includes(',')) {
      const first = val.split(',')[0].trim();
      return LABEL_TO_SERVICE[first] || (serviceEnumValues.includes(first) ? first : SERVICES.GENERAL);
    }
    return SERVICES.GENERAL;
  }),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000, 'Message cannot exceed 5000 characters'),
  honeypot: z.string().optional().default('') // anti-bot trap
});

export const loginSchema = z.object({
  login: z.string().trim().min(3, 'Username or email is required').max(150),
  password: z.string().min(1, 'Password is required')
});

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .max(50)
    .refine((val) => !val || (val.length >= 3 && /^[a-z0-9_.-]+$/.test(val)), {
      message: 'Username must be at least 3 characters and contain only alphanumeric characters, dots, underscores, or hyphens'
    })
    .optional()
    .default(''),
  email: z.string().trim().email('Invalid email address').max(150),
  role: z
    .enum(['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'])
    .transform((r) => (r === 'SUPER_ADMIN' ? ROLES.ADMIN : r))
    .default(ROLES.EMPLOYEE),
  expertise: z.array(z.enum(serviceEnumValues)).default([]),
  temporaryPassword: z
    .string()
    .refine((val) => !val || val.length >= 8, {
      message: 'Temporary password must be at least 8 characters'
    })
    .optional()
    .default(''),
  mustChangePassword: z.boolean().optional().default(true)
});

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email('Invalid email address').max(150).optional(),
  role: z
    .enum(['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'])
    .transform((r) => (r === 'SUPER_ADMIN' ? ROLES.ADMIN : r))
    .optional(),
  expertise: z.array(z.enum(serviceEnumValues)).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  mustChangePassword: z.boolean().optional()
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(Object.values(LEAD_STATUS)),
  note: z.string().trim().max(1000).optional()
});

export const addLeadNoteSchema = z.object({
  text: z.string().trim().min(1, 'Note cannot be empty').max(2000, 'Note cannot exceed 2000 characters')
});

export const assignLeadSchema = z.object({
  employeeId: z.string().nullable().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});
