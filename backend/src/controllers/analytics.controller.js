import crypto from 'crypto';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { buildLeadScopeFilter } from '../middleware/auth.js';
import { getRedisClient } from '../config/redis.js';
import { SERVICES, LEAD_STATUS, ROLES } from '../constants/index.js';
import { logger } from '../utils/logger.js';

const ANALYTICS_CACHE_TTL = 300; // 5 minutes

function getCacheKey(prefix, req) {
  const queryStr = JSON.stringify(req.query);
  const userScope = `${req.user.role}:${req.user._id}:${(req.user.expertise || []).sort().join(',')}`;
  const hash = crypto.createHash('md5').update(`${queryStr}:${userScope}`).digest('hex');
  return `analytics:${prefix}:${hash}`;
}

/**
 * GET /api/v1/analytics/overview
 * Lead counts, conversion rates, and period comparisons
 */
export async function getOverviewAnalytics(req, res, next) {
  try {
    const redis = getRedisClient();
    const cacheKey = getCacheKey('overview', req);

    // 1. Try Redis cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          source: 'cache',
          requestId: req.id
        });
      }
    } catch (err) {
      logger.warn({ msg: 'Redis cache read error', error: err.message });
    }

    // 2. Build filter
    const baseFilter = {};
    if (req.query.service && req.query.service !== 'ALL') {
      baseFilter.service = req.query.service;
    }
    if (req.query.assignedTo && req.query.assignedTo !== 'ALL') {
      baseFilter.assignedTo = req.query.assignedTo;
    }

    // Date range for current period
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const startDate = req.query.startDate ? new Date(req.query.startDate) : currentMonthStart;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : now;

    // Apply DB-level role and expertise scope
    const scopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // 3. Compute status breakdown in single aggregation pipeline
    const statusCounts = await Lead.aggregate([
      { $match: scopedFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {
      TOTAL: 0,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      PROPOSAL: 0,
      NEGOTIATION: 0,
      CONVERTED: 0,
      LOST: 0,
      CLOSED: 0
    };

    let totalLeads = 0;
    statusCounts.forEach((sc) => {
      if (countsMap[sc._id] !== undefined) {
        countsMap[sc._id] = sc.count;
      }
      totalLeads += sc.count;
    });
    countsMap.TOTAL = totalLeads;

    // Conversion rate for selected range: (Converted / Total) * 100
    const conversionRate = totalLeads > 0 ? Math.round((countsMap.CONVERTED / totalLeads) * 1000) / 10 : 0;

    // 4. Period Comparison: Current Month vs Previous Month
    const prevMonthScopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    const [prevTotal, prevConverted] = await Promise.all([
      Lead.countDocuments(prevMonthScopedFilter),
      Lead.countDocuments({ ...prevMonthScopedFilter, status: LEAD_STATUS.CONVERTED })
    ]);

    let conversionChangePercent = null;
    let baselineNote = null;

    if (prevConverted === 0) {
      baselineNote = 'No previous-period baseline';
    } else {
      // Formula: ((Current - Previous) / Previous) * 100
      const diff = countsMap.CONVERTED - prevConverted;
      conversionChangePercent = Math.round((diff / prevConverted) * 1000) / 10;
    }

    const payload = {
      period: {
        startDate,
        endDate
      },
      counts: countsMap,
      conversionRate,
      comparison: {
        previousMonthConverted: prevConverted,
        currentMonthConverted: countsMap.CONVERTED,
        percentageChange: conversionChangePercent,
        baselineNote
      }
    };

    // Cache in Redis
    try {
      await redis.set(cacheKey, JSON.stringify(payload), 'EX', ANALYTICS_CACHE_TTL);
    } catch (e) {
      logger.warn({ msg: 'Failed to write analytics to Redis cache', error: e.message });
    }

    return res.status(200).json({
      success: true,
      data: payload,
      source: 'database',
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analytics/services
 * Service breakdown of leads and conversion rates
 */
export async function getServiceAnalytics(req, res, next) {
  try {
    const redis = getRedisClient();
    const cacheKey = getCacheKey('services', req);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ success: true, data: JSON.parse(cached), source: 'cache', requestId: req.id });
      }
    } catch {}

    const scopedFilter = buildLeadScopeFilter(req.user);

    const breakdown = await Lead.aggregate([
      { $match: scopedFilter },
      {
        $group: {
          _id: '$service',
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.CONVERTED] }, 1, 0] } },
          qualified: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.QUALIFIED] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const enriched = breakdown.map((item) => ({
      service: item._id,
      total: item.total,
      converted: item.converted,
      qualified: item.qualified,
      lost: item.lost,
      conversionRate: item.total > 0 ? Math.round((item.converted / item.total) * 1000) / 10 : 0
    }));

    try {
      await redis.set(cacheKey, JSON.stringify(enriched), 'EX', ANALYTICS_CACHE_TTL);
    } catch {}

    return res.status(200).json({
      success: true,
      data: enriched,
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analytics/employees
 * Employee performance metrics (Admin/Super Admin only)
 */
export async function getEmployeeAnalytics(req, res, next) {
  try {
    const employees = await User.find({ role: { $in: [ROLES.EMPLOYEE, ROLES.ADMIN] } })
      .select('name username role expertise status')
      .lean();

    const empMetrics = await Lead.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.CONVERTED] }, 1, 0] } },
          inProgress: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.CONTACTED, LEAD_STATUS.QUALIFIED, LEAD_STATUS.PROPOSAL, LEAD_STATUS.NEGOTIATION]] },
                1,
                0
              ]
            }
          },
          lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } }
        }
      }
    ]);

    const metricsMap = new Map();
    empMetrics.forEach((m) => metricsMap.set(m._id.toString(), m));

    const result = employees.map((emp) => {
      const stats = metricsMap.get(emp._id.toString()) || { totalLeads: 0, converted: 0, inProgress: 0, lost: 0 };
      const conversionRate = stats.totalLeads > 0 ? Math.round((stats.converted / stats.totalLeads) * 1000) / 10 : 0;
      return {
        id: emp._id,
        name: emp.name,
        username: emp.username,
        role: emp.role,
        expertise: emp.expertise,
        status: emp.status,
        ...stats,
        conversionRate
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}
