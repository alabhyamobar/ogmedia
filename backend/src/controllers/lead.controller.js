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
import { invalidateCachePattern } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

// Helper to invalidate analytics cache (safely handles Redis online/offline)
async function invalidateAnalyticsCache() {
  await invalidateCachePattern('analytics:*');
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

    const [rawLeads, total] = await Promise.all([
      Lead.find(scopedFilter)
        .select('-notes') // Exclude heavy notes array from list view for high performance
        .populate('assignedTo', 'name username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(scopedFilter)
    ]);

    // GHOST DEVELOPER: If requester is not Developer, disguise any Developer assignment as unassigned
    const leads = rawLeads.map((l) => {
      if (req.user.role !== ROLES.DEVELOPER && l.assignedTo?.role === ROLES.DEVELOPER) {
        return { ...l, assignedTo: null };
      }
      return l;
    });

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
  const leadDoc = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name username email role expertise')
    .populate('notes.author', 'name username role')
    .lean();

  if (!leadDoc) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lead not found.' },
      requestId: req.id
    });
  }

  const lead = { ...leadDoc };

  // GHOST DEVELOPER: Redact developer presence from lead detail when accessed by admin or staff
  if (req.user.role !== ROLES.DEVELOPER) {
    if (lead.assignedTo?.role === ROLES.DEVELOPER) {
      lead.assignedTo = null;
    }
    if (lead.timeline) {
      lead.timeline = lead.timeline.map((tl) => {
        if (tl.performedByName && tl.performedByName.toLowerCase().includes('developer')) {
          return { ...tl, performedByName: 'System Operations' };
        }
        return tl;
      });
    }
    if (lead.notes) {
      lead.notes = lead.notes.map((n) => {
        if (n.author?.role === ROLES.DEVELOPER || (n.authorName && n.authorName.toLowerCase().includes('developer'))) {
          return {
            ...n,
            authorName: 'System Operations'
          };
        }
        return n;
      });
    }
  }

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
    const actorName = req.user.role === ROLES.DEVELOPER ? 'System Operations' : req.user.name;
    lead.timeline.push({
      event: 'LEAD_UPDATED',
      performedBy: req.user._id,
      performedByName: actorName,
      details: req.user.role === ROLES.DEVELOPER ? 'Customer details updated by System Operations' : `Customer details updated by ${req.user.name}`,
      timestamp: new Date()
    });

    await lead.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.LEAD_UPDATED,
      targetType: 'LEAD',
      targetId: lead._id.toString(),
      performedBy: req.user._id,
      performedByName: actorName,
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

    const actorName = req.user.role === ROLES.DEVELOPER ? 'System Operations' : req.user.name;

    // Append to timeline
    lead.timeline.push({
      event: 'STATUS_CHANGE',
      performedBy: req.user._id,
      performedByName: actorName,
      details: `Status changed from ${oldStatus} to ${status}${note ? `: ${note}` : ''}`,
      timestamp: new Date()
    });

    // Append note if provided
    if (note) {
      lead.notes.push({
        author: req.user._id,
        authorName: actorName,
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
      performedByName: actorName,
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
    const actorName = req.user.role === ROLES.DEVELOPER ? 'System Operations' : req.user.name;

    const newNote = {
      author: req.user._id,
      authorName: actorName,
      text,
      createdAt: new Date()
    };

    lead.notes.push(newNote);
    lead.timeline.push({
      event: 'NOTE_ADDED',
      performedBy: req.user._id,
      performedByName: actorName,
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
    const actorName = req.user.role === ROLES.DEVELOPER ? 'System Operations' : req.user.name;

    if (!employeeId) {
      // Unassign
      const prevAssigned = lead.assignedTo;
      lead.assignedTo = null;
      lead.timeline.push({
        event: 'LEAD_UNASSIGNED',
        performedBy: req.user._id,
        performedByName: actorName,
        details: 'Lead unassigned',
        timestamp: new Date()
      });
      await lead.save();

      await AuditLog.create({
        action: AUDIT_ACTIONS.LEAD_ASSIGNED,
        targetType: 'LEAD',
        targetId: lead._id.toString(),
        performedBy: req.user._id,
        performedByName: actorName,
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

    // Enforce expertise check on assignment (Developer can assign to any personnel unconditionally)
    if (req.user.role !== ROLES.DEVELOPER && employee.role === ROLES.EMPLOYEE && (!employee.expertise || !employee.expertise.includes(lead.service))) {
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
      performedByName: actorName,
      details: `Lead assigned to ${employee.name} (${employee.username})`,
      timestamp: new Date()
    });

    await lead.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.LEAD_ASSIGNED,
      targetType: 'LEAD',
      targetId: lead._id.toString(),
      performedBy: req.user._id,
      performedByName: actorName,
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
