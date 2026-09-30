import mongoose from 'mongoose';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { buildLeadScopeFilter } from '../middleware/auth.js';
import {
  updateLeadStatusSchema,
  addLeadNoteSchema,
  assignLeadSchema
} from '../validators/index.js';
import { AUDIT_ACTIONS, LEAD_STATUS, ROLES } from '../constants/index.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// Helper to invalidate analytics cache
async function invalidateAnalyticsCache() {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys('analytics:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ msg: 'Analytics cache invalidation error', error: err.message });
  }
}

/**
 * GET /api/v1/leads
 * Server-side paginated, filtered, and expertise-scoped lead list
 */
export async function getLeads(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
    const skip = (page - 1) * limit;

    const baseFilter = {};

    // 1. Filter by Service (if provided)
    if (req.query.service && req.query.service !== 'ALL') {
      baseFilter.service = req.query.service;
    }

    // 2. Filter by Status (if provided)
    if (req.query.status && req.query.status !== 'ALL') {
      baseFilter.status = req.query.status;
    }

    // 3. Filter by Assigned Employee
    if (req.query.assignedTo) {
      if (req.query.assignedTo === 'UNASSIGNED') {
        baseFilter.assignedTo = null;
      } else if (mongoose.isValidObjectId(req.query.assignedTo)) {
        baseFilter.assignedTo = req.query.assignedTo;
      }
    }

    // 4. Date Range Filter
    if (req.query.startDate || req.query.endDate) {
      baseFilter.createdAt = {};
      if (req.query.startDate) {
        baseFilter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        baseFilter.createdAt.$lte = endDate;
      }
    }

    // 5. Search Filter (sanitized text search across name, email, phone, company)
    if (req.query.search && req.query.search.trim() !== '') {
      const sanitizedSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(sanitizedSearch, 'i');
      baseFilter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { company: regex }
      ];
    }

    // 6. Apply expertise & role scope filter (CRITICAL: Database-level enforcement!)
    const scopedFilter = buildLeadScopeFilter(req.user, baseFilter);

    const [leads, total] = await Promise.all([
      Lead.find(scopedFilter)
        .select('-notes') // Exclude heavy notes array from list view for high performance
        .populate('assignedTo', 'name username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(scopedFilter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        leads,
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

/**
 * GET /api/v1/leads/:id
 * Fetches full details for a single lead with notes and timeline
 */
export async function getLeadById(req, res) {
  // Access was already verified by requireLeadAccess middleware
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name username email role expertise')
    .populate('notes.author', 'name username role');

  return res.status(200).json({
    success: true,
    data: { lead },
    requestId: req.id
  });
}

/**
 * PATCH /api/v1/leads/:id
 * Update customer details with strict field whitelisting (Mass Assignment Protection)
 */
export async function updateLead(req, res, next) {
  try {
    const lead = req.lead;

    // Explicit field whitelist
    const allowedFields = ['name', 'phone', 'company', 'message'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(lead, updates);
    lead.timeline.push({
      event: 'LEAD_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: `Customer details updated by ${req.user.name}`,
      timestamp: new Date()
    });

    await lead.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.LEAD_UPDATED,
      targetType: 'LEAD',
      targetId: lead._id.toString(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: updates
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: { lead },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/leads/:id/status
 * Updates lead status with audit logging, timeline entry, and cache invalidation
 */
export async function updateLeadStatus(req, res, next) {
  try {
    const { status, note } = updateLeadStatusSchema.parse(req.body);
    const lead = req.lead;
    const oldStatus = lead.status;

    if (oldStatus === status) {
      return res.status(200).json({
        success: true,
        message: 'Status is already set to ' + status,
        data: { lead },
        requestId: req.id
      });
    }

    lead.status = status;

    // Track contact and conversion timestamps
    if (
      [
        LEAD_STATUS.CONTACTED,
        LEAD_STATUS.QUALIFIED,
        LEAD_STATUS.PROPOSAL,
        LEAD_STATUS.NEGOTIATION
      ].includes(status) &&
      !lead.lastContactedAt
    ) {
      lead.lastContactedAt = new Date();
    }

    if (status === LEAD_STATUS.CONVERTED) {
      lead.convertedAt = new Date();
    }

    // Append to timeline
    lead.timeline.push({
      event: 'STATUS_CHANGE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: `Status changed from ${oldStatus} to ${status}${note ? `: ${note}` : ''}`,
      timestamp: new Date()
    });

    // Append note if provided
    if (note) {
      lead.notes.push({
        author: req.user._id,
        authorName: req.user.name,
        text: `[Status Change to ${status}] ${note}`,
        createdAt: new Date()
      });
    }

    await lead.save();

    // Create Audit Log
    await AuditLog.create({
      action: AUDIT_ACTIONS.LEAD_STATUS_CHANGED,
      targetType: 'LEAD',
      targetId: lead._id.toString(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { oldStatus, newStatus: status, note }
    }).catch(() => {});

    // Invalidate analytics cache
    await invalidateAnalyticsCache();

    return res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}.`,
      data: { lead },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/leads/:id/notes
 * Adds an internal follow-up note to the lead
 */
export async function addLeadNote(req, res, next) {
  try {
    const { text } = addLeadNoteSchema.parse(req.body);
    const lead = req.lead;

    const newNote = {
      author: req.user._id,
      authorName: req.user.name,
      text,
      createdAt: new Date()
    };

    lead.notes.push(newNote);
    lead.timeline.push({
      event: 'NOTE_ADDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: `Note added: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"`,
      timestamp: new Date()
    });

    await lead.save();

    return res.status(201).json({
      success: true,
      message: 'Note added successfully.',
      data: { note: newNote, lead },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/leads/:id/assignment
 * Assigns lead to an employee with expertise validation
 */
export async function assignLead(req, res, next) {
  try {
    const { employeeId } = assignLeadSchema.parse(req.body);
    const lead = req.lead;

    if (!employeeId) {
      // Unassign
      const prevAssigned = lead.assignedTo;
      lead.assignedTo = null;
      lead.timeline.push({
        event: 'LEAD_UNASSIGNED',
        performedBy: req.user._id,
        performedByName: req.user.name,
        details: 'Lead unassigned',
        timestamp: new Date()
      });
      await lead.save();

      await AuditLog.create({
        action: AUDIT_ACTIONS.LEAD_ASSIGNED,
        targetType: 'LEAD',
        targetId: lead._id.toString(),
        performedBy: req.user._id,
        performedByName: req.user.name,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { previousAssigned: prevAssigned, newAssigned: null }
      }).catch(() => {});

      await invalidateAnalyticsCache();

      return res.status(200).json({
        success: true,
        message: 'Lead unassigned.',
        data: { lead },
        requestId: req.id
      });
    }

    // Verify employee exists and is active
    const employee = await User.findById(employeeId);
    if (!employee || employee.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found or inactive.' },
        requestId: req.id
      });
    }

    // Enforce expertise check on assignment!
    // "An employee should not be assigned a lead outside their allowed expertise unless an administrator explicitly changes the access model."
    if (employee.role === ROLES.EMPLOYEE && (!employee.expertise || !employee.expertise.includes(lead.service))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXPERTISE_MISMATCH',
          message: `Cannot assign lead to ${employee.name}. Their expertise does not cover ${lead.service}.`
        },
        requestId: req.id
      });
    }

    lead.assignedTo = employee._id;
    lead.timeline.push({
      event: 'LEAD_ASSIGNED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: `Lead assigned to ${employee.name} (${employee.username})`,
      timestamp: new Date()
    });

    await lead.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.LEAD_ASSIGNED,
      targetType: 'LEAD',
      targetId: lead._id.toString(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { assignedToId: employee._id, assignedToName: employee.name, service: lead.service }
    }).catch(() => {});

    await invalidateAnalyticsCache();

    return res.status(200).json({
      success: true,
      message: `Lead successfully assigned to ${employee.name}.`,
      data: { lead },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}
