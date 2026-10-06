import crypto from 'crypto';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { buildLeadScopeFilter } from '../middleware/auth.js';
import { getCache, setCache } from '../utils/cache.js';
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
    const cacheKey = getCacheKey('overview', req);

    // 1. Try Cache (Redis or in-memory fallback)
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        source: 'cache',
        requestId: req.id
      });
    }

    // 2. Build filter
    const baseFilter = {};
    if (req.query.service && req.query.service !== 'ALL') {
      baseFilter.service = req.query.service;
    }
    if (req.query.assignedTo && req.query.assignedTo !== 'ALL') {
      baseFilter.assignedTo = req.query.assignedTo;
    }

    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate);
      }
    } else if (req.query.days) {
      const days = parseInt(req.query.days, 10);
      if (!isNaN(days) && days > 0) {
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      }
    }

    const timeFilter = {};
    if (startDate) {
      timeFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Apply DB-level role and expertise scope
    const scopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      ...timeFilter
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

    // 4. Period Comparison: Current Calendar Month vs Previous Calendar Month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthScopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      createdAt: { $gte: currentMonthStart, $lte: now }
    });

    const prevMonthScopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    const [currentConverted, prevConverted, currentTotal, prevTotal] = await Promise.all([
      Lead.countDocuments({ ...currentMonthScopedFilter, status: LEAD_STATUS.CONVERTED }),
      Lead.countDocuments({ ...prevMonthScopedFilter, status: LEAD_STATUS.CONVERTED }),
      Lead.countDocuments(currentMonthScopedFilter),
      Lead.countDocuments(prevMonthScopedFilter)
    ]);

    let conversionChangePercent = null;
    let baselineNote = null;

    if (prevConverted === 0) {
      baselineNote = currentConverted > 0 ? `+${currentConverted} won this month` : 'No previous-period baseline';
    } else {
      // Formula: ((Current - Previous) / Previous) * 100
      const diff = currentConverted - prevConverted;
      conversionChangePercent = Math.round((diff / prevConverted) * 1000) / 10;
    }

    const payload = {
      period: {
        startDate,
        endDate,
        isAllTime: !startDate
      },
      counts: countsMap,
      conversionRate,
      comparison: {
        previousMonthConverted: prevConverted,
        currentMonthConverted: currentConverted,
        previousMonthTotal: prevTotal,
        currentMonthTotal: currentTotal,
        percentageChange: conversionChangePercent,
        baselineNote
      }
    };

    // Cache result
    await setCache(cacheKey, payload, ANALYTICS_CACHE_TTL);

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
    const cacheKey = getCacheKey('services', req);

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, source: 'cache', requestId: req.id });
    }

    const scopedFilter = buildLeadScopeFilter(req.user);

    const breakdown = await Lead.aggregate([
      { $match: scopedFilter },
      {
        $group: {
          _id: '$service',
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.CONVERTED] }, 1, 0] } },
          qualified: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.QUALIFIED, LEAD_STATUS.PROPOSAL, LEAD_STATUS.NEGOTIATION]] },
                1,
                0
              ]
            }
          },
          lost: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.LOST, LEAD_STATUS.CLOSED]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Build map for ALL defined services so no sector is missing
    const serviceMap = new Map();
    Object.values(SERVICES).forEach((svc) => {
      serviceMap.set(svc, {
        service: svc,
        total: 0,
        converted: 0,
        qualified: 0,
        lost: 0,
        conversionRate: 0
      });
    });

    breakdown.forEach((item) => {
      if (serviceMap.has(item._id)) {
        const s = serviceMap.get(item._id);
        s.total = item.total;
        s.converted = item.converted;
        s.qualified = item.qualified;
        s.lost = item.lost;
        s.conversionRate = item.total > 0 ? Math.round((item.converted / item.total) * 1000) / 10 : 0;
      }
    });

    const enriched = Array.from(serviceMap.values()).sort((a, b) => b.total - a.total);

    await setCache(cacheKey, enriched, ANALYTICS_CACHE_TTL);

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
    const cacheKey = getCacheKey('employees', req);

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, source: 'cache', requestId: req.id });
    }

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
          lost: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.LOST, LEAD_STATUS.CLOSED]] },
                1,
                0
              ]
            }
          }
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

    await setCache(cacheKey, result, ANALYTICS_CACHE_TTL);

    return res.status(200).json({
      success: true,
      data: result,
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analytics/timeline
 * Aggregated time-series trend data for interactive charts
 */
export async function getTimelineAnalytics(req, res, next) {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 7), 365);
    const cacheKey = getCacheKey(`timeline:${days}`, req);

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, source: 'cache', requestId: req.id });
    }

    const baseFilter = {};
    if (req.query.service && req.query.service !== 'ALL') {
      baseFilter.service = req.query.service;
    }
    if (req.query.assignedTo && req.query.assignedTo !== 'ALL') {
      baseFilter.assignedTo = req.query.assignedTo;
    }

    // Determine the calendar date window: exactly `days` continuous days up to now
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const scopedFilter = buildLeadScopeFilter(req.user, {
      ...baseFilter,
      createdAt: { $gte: startDate, $lte: now }
    });

    const timeline = await Lead.aggregate([
      { $match: scopedFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.CONVERTED] }, 1, 0] }
          },
          qualified: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.QUALIFIED, LEAD_STATUS.PROPOSAL, LEAD_STATUS.NEGOTIATION]] },
                1,
                0
              ]
            }
          },
          lost: {
            $sum: {
              $cond: [
                { $in: ['$status', [LEAD_STATUS.LOST, LEAD_STATUS.CLOSED]] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build contiguous calendar map for all `days` days
    const dateMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(dateStr, {
        date: dateStr,
        fullDate,
        total: 0,
        converted: 0,
        qualified: 0,
        lost: 0,
        conversionRate: 0
      });
    }

    timeline.forEach((item) => {
      if (dateMap.has(item._id)) {
        const entry = dateMap.get(item._id);
        entry.total = item.total;
        entry.converted = item.converted;
        entry.qualified = item.qualified;
        entry.lost = item.lost;
        entry.conversionRate = item.total > 0 ? Math.round((item.converted / item.total) * 1000) / 10 : 0;
      }
    });

    const result = Array.from(dateMap.values());

    await setCache(cacheKey, result, ANALYTICS_CACHE_TTL);

    return res.status(200).json({
      success: true,
      data: result,
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}

