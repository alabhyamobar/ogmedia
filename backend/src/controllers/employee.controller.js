import crypto from 'crypto';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/index.js';
import { AUDIT_ACTIONS, ROLES } from '../constants/index.js';

// Helper to generate secure temporary password
function generateSecurePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let pwd = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pwd += chars[randomBytes[i] % chars.length];
  }
  return pwd;
}

// Helper to generate a unique collision-free username
export async function generateUniqueUsername(name = '', email = '') {
  let base = '';
  if (name && typeof name === 'string' && name.trim()) {
    base = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');
  }

  if (!base && email && typeof email === 'string' && email.trim()) {
    const localPart = email.split('@')[0];
    base = localPart
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');
  }

  if (!base || base.length < 3) {
    base = (base || 'agent') + Math.floor(100 + Math.random() * 900);
  }

  base = base.substring(0, 35);

  let candidate = base;
  let counter = 1;

  while (await User.exists({ username: candidate })) {
    candidate = `${base}${counter}`;
    counter++;
  }

  return candidate;
}

export async function suggestUsername(req, res, next) {
  try {
    const { name = '', email = '' } = req.query;
    const username = await generateUniqueUsername(name, email);
    const suggestedPassword = generateSecurePassword(12);

    return res.status(200).json({
      success: true,
      data: {
        username,
        suggestedPassword
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployees(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && ['ACTIVE', 'INACTIVE'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.role && Object.values(ROLES).includes(req.query.role)) {
      filter.role = req.query.role;
    }

    if (req.query.search && req.query.search.trim() !== '') {
      const sanitized = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(sanitized, 'i');
      filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    const [employees, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Attach basic lead counts
    const employeeIds = employees.map((e) => e._id);
    const leadCounts = await Lead.aggregate([
      { $match: { assignedTo: { $in: employeeIds } } },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'CONVERTED'] }, 1, 0] } }
        }
      }
    ]);

    const countsMap = new Map();
    leadCounts.forEach((c) => countsMap.set(c._id.toString(), c));

    const enriched = employees.map((emp) => {
      const stats = countsMap.get(emp._id.toString()) || { totalAssigned: 0, converted: 0 };
      return {
        ...emp,
        stats
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        employees: enriched,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    // Only Administrators can create employees and assign roles
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only Administrators can onboard new personnel and assign roles.' },
        requestId: req.id
      });
    }

    const validatedData = createEmployeeSchema.parse(req.body);

    // Auto-generate unique username if not provided or empty
    let username = validatedData.username;
    if (!username || username.trim() === '') {
      username = await generateUniqueUsername(validatedData.name, validatedData.email);
    }

    // Check duplicate username or email
    const existing = await User.findOne({
      $or: [{ username }, { email: validatedData.email }]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: existing.username === username ? 'Username is already taken.' : 'Email is already registered.'
        },
        requestId: req.id
      });
    }

    const temporaryPassword = validatedData.temporaryPassword || generateSecurePassword(12);
    const passwordHash = await User.hashPassword(temporaryPassword);

    const newEmployee = await User.create({
      name: validatedData.name,
      username,
      email: validatedData.email,
      passwordHash,
      role: validatedData.role || ROLES.EMPLOYEE,
      expertise: validatedData.expertise || [],
      status: 'ACTIVE',
      mustChangePassword: true
    });

    await AuditLog.create({
      action: AUDIT_ACTIONS.EMPLOYEE_CREATED,
      targetType: 'USER',
      targetId: newEmployee._id.toString(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        username: newEmployee.username,
        role: newEmployee.role,
        expertise: newEmployee.expertise
      }
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Employee account created successfully.',
      data: {
        employee: {
          id: newEmployee._id,
          name: newEmployee.name,
          username: newEmployee.username,
          email: newEmployee.email,
          role: newEmployee.role,
          expertise: newEmployee.expertise,
          status: newEmployee.status,
          mustChangePassword: newEmployee.mustChangePassword,
          createdAt: newEmployee.createdAt
        },
        temporaryPassword
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await User.findById(req.params.id)
      .select('-passwordHash -passwordResetToken -passwordResetExpires')
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found.' },
        requestId: req.id
      });
    }

    // Lead metrics for this employee
    const [totalAssigned, convertedCount, activeCount] = await Promise.all([
      Lead.countDocuments({ assignedTo: employee._id }),
      Lead.countDocuments({ assignedTo: employee._id, status: 'CONVERTED' }),
      Lead.countDocuments({ assignedTo: employee._id, status: { $nin: ['CONVERTED', 'LOST', 'CLOSED'] } })
    ]);

    const conversionRate = totalAssigned > 0 ? Math.round((convertedCount / totalAssigned) * 1000) / 10 : 0;

    return res.status(200).json({
      success: true,
      data: {
        employee: {
          ...employee,
          stats: {
            totalAssigned,
            convertedCount,
            activeCount,
            conversionRate
          }
        }
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const validatedData = updateEmployeeSchema.parse(req.body);
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found.' },
        requestId: req.id
      });
    }

    // Strict Role Assignment Protection: Only ADMIN can assign or alter any role!
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    if (validatedData.role && validatedData.role !== employee.role) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only Administrators can assign or modify security clearance roles.' },
          requestId: req.id
        });
      }
    }

    const auditChanges = {};

    if (validatedData.name) {
      employee.name = validatedData.name;
    }

    if (validatedData.email && validatedData.email !== employee.email) {
      const emailExists = await User.findOne({ email: validatedData.email, _id: { $ne: employee._id } });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email address is already in use by another account.' },
          requestId: req.id
        });
      }
      employee.email = validatedData.email;
    }

    if (validatedData.role && validatedData.role !== employee.role) {
      auditChanges.oldRole = employee.role;
      auditChanges.newRole = validatedData.role;
      employee.role = validatedData.role;

      await AuditLog.create({
        action: AUDIT_ACTIONS.EMPLOYEE_ROLE_CHANGED,
        targetType: 'USER',
        targetId: employee._id.toString(),
        performedBy: req.user._id,
        performedByName: req.user.name,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { oldRole: auditChanges.oldRole, newRole: auditChanges.newRole, targetUsername: employee.username }
      }).catch(() => {});
    }

    if (validatedData.expertise) {
      auditChanges.oldExpertise = employee.expertise;
      auditChanges.newExpertise = validatedData.expertise;
      employee.expertise = validatedData.expertise;

      await AuditLog.create({
        action: AUDIT_ACTIONS.EMPLOYEE_EXPERTISE_CHANGED,
        targetType: 'USER',
        targetId: employee._id.toString(),
        performedBy: req.user._id,
        performedByName: req.user.name,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: auditChanges
      }).catch(() => {});
    }

    if (validatedData.status && validatedData.status !== employee.status) {
      employee.status = validatedData.status;
      const action =
        validatedData.status === 'ACTIVE'
          ? AUDIT_ACTIONS.EMPLOYEE_ENABLED
          : AUDIT_ACTIONS.EMPLOYEE_DISABLED;

      await AuditLog.create({
        action,
        targetType: 'USER',
        targetId: employee._id.toString(),
        performedBy: req.user._id,
        performedByName: req.user.name,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { status: validatedData.status }
      }).catch(() => {});
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          username: employee.username,
          email: employee.email,
          role: employee.role,
          expertise: employee.expertise,
          status: employee.status,
          updatedAt: employee.updatedAt
        }
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

export async function resetEmployeePassword(req, res, next) {
  try {
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only Administrators can regenerate employee credentials.' },
        requestId: req.id
      });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found.' },
        requestId: req.id
      });
    }

    const temporaryPassword = generateSecurePassword(12);
    employee.passwordHash = await User.hashPassword(temporaryPassword);
    employee.mustChangePassword = true;
    employee.failedLoginAttempts = 0;
    employee.lockUntil = null;
    await employee.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      targetType: 'USER',
      targetId: employee._id.toString(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { resetByAdmin: true, employeeUsername: employee.username, employeeRole: employee.role }
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Temporary password generated.',
      data: {
        temporaryPassword,
        employee: {
          id: employee._id,
          name: employee.name,
          username: employee.username,
          role: employee.role
        }
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}
