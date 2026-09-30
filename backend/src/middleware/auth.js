import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { ROLES } from '../constants/index.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ogmedia_super_secret_crm_jwt_production_key_2026';

/**
 * Authentication middleware verifying short-lived JWT token
 */
export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // 2. Check HTTP-only cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. No token provided.'
        },
        requestId: req.id
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to ensure they still exist and are ACTIVE
    const user = await User.findById(decoded.userId).select('+status');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists.'
        },
        requestId: req.id
      });
    }

    // Check account status (e.g. disabled employees)
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your account has been deactivated. Please contact an administrator.'
        },
        requestId: req.id
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Session has expired. Please refresh your token or log in again.'
        },
        requestId: req.id
      });
    }

    logger.warn({ msg: 'Authentication failed', err: error.message, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.'
      },
      requestId: req.id
    });
  }
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
        requestId: req.id
      });
    }

    const userRole = req.user.role === 'SUPER_ADMIN' ? 'ADMIN' : req.user.role;
    const normalizedAllowed = allowedRoles.map((r) => (r === 'SUPER_ADMIN' ? 'ADMIN' : r));

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.'
        },
        requestId: req.id
      });
    }

    next();
  };
}

/**
 * Builds MongoDB filter scoping leads to the user's role and expertise.
 * Strictly guarantees:
 * 1. Employees never receive leads outside their assigned expertise at the DB layer.
 * 2. Unassigned inquiries are strictly restricted to Admin clearance (employees cannot see unassigned leads).
 */
export function buildLeadScopeFilter(user, additionalFilters = {}) {
  const filter = { ...additionalFilters };

  // ADMIN has global access across all domains and all assignment states (including unassigned)
  if (user.role === ROLES.ADMIN || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return filter;
  }

  // EMPLOYEE role: Strictly scope to services in user's expertise array
  const allowedServices = user.expertise || [];
  if (allowedServices.length === 0) {
    // If employee has no expertise assigned, they can match nothing
    filter.service = { $in: [] };
    filter.assignedTo = { $ne: null };
    return filter;
  }

  // If a specific service filter was requested, ensure it is within their allowed expertise
  if (filter.service) {
    if (typeof filter.service === 'string') {
      if (!allowedServices.includes(filter.service)) {
        filter.service = { $in: [] }; // Cannot view
      }
    } else if (filter.service.$in) {
      filter.service.$in = filter.service.$in.filter((s) => allowedServices.includes(s));
    }
  } else {
    filter.service = { $in: allowedServices };
  }

  // Unassigned inquiries must NEVER be displayed to any employee except admin:
  // If an employee requests unassigned leads specifically, return empty match
  if (filter.assignedTo === null || filter.assignedTo === 'UNASSIGNED') {
    filter.assignedTo = { $in: [] };
  } else if (!filter.assignedTo) {
    // By default, employees can only see inquiries that are assigned
    filter.assignedTo = { $ne: null };
  }

  return filter;
}

/**
 * Object-Level Authorization Middleware for Leads (/leads/:id)
 * Verifies the authenticated user is permitted to view or mutate this specific lead.
 */
export async function requireLeadAccess(req, res, next) {
  try {
    const leadId = req.params.id;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found.'
        },
        requestId: req.id
      });
    }

    // Admins have full access
    if (req.user.role === ROLES.ADMIN || req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      req.lead = lead;
      return next();
    }

    // Unassigned inquiries can only be viewed or triaged by Admin
    if (!lead.assignedTo) {
      logger.warn({
        msg: 'Unauthorized access to unassigned lead by employee',
        userId: req.user._id,
        leadId: lead._id,
        leadService: lead.service
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Unassigned inquiries can only be accessed and triaged by administrators.'
        },
        requestId: req.id
      });
    }

    // Employees can only access if the lead matches their expertise
    const userExpertise = req.user.expertise || [];
    if (!userExpertise.includes(lead.service)) {
      logger.warn({
        msg: 'Unauthorized lead access attempt (IDOR prevention)',
        userId: req.user._id,
        leadId: lead._id,
        leadService: lead.service,
        userExpertise
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to access leads in this service category.'
        },
        requestId: req.id
      });
    }

    req.lead = lead;
    next();
  } catch (error) {
    logger.error({ msg: 'Error verifying lead access', error: error.message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to verify lead permissions.' },
      requestId: req.id
    });
  }
}
