import { v4 as uuidv4 } from 'uuid';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { AUDIT_ACTIONS, QUEUE_CONFIG } from '../constants/index.js';
import { invalidateCachePattern } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

// In-memory duplicate set with TTL to catch simultaneous multi-requests within milliseconds
const inMemoryDeduplication = new Map();

function cleanInMemoryDedup() {
  const now = Date.now();
  for (const [hash, expiresAt] of inMemoryDeduplication.entries()) {
    if (expiresAt <= now) {
      inMemoryDeduplication.delete(hash);
    }
  }
}

/**
 * Checks if a lead submission is a duplicate directly against MongoDB and memory
 */
export async function checkDuplicateInDatabase(email, phone, service, windowSeconds = null) {
  const ttl = windowSeconds || parseInt(process.env.LEAD_DUPLICATE_WINDOW_SECONDS || `${QUEUE_CONFIG.DUPLICATE_WINDOW_SECONDS}`, 10);
  const normalizedEmail = (email || '').toLowerCase().trim();
  const normalizedPhone = (phone || '').trim();
  const dedupKey = `${normalizedEmail}:${normalizedPhone}:${service}`;

  // 1. Check in-memory fast window
  cleanInMemoryDedup();
  if (inMemoryDeduplication.has(dedupKey)) {
    return true;
  }

  // 2. Check MongoDB collection within the duplicate window
  const windowStart = new Date(Date.now() - ttl * 1000);
  const query = {
    email: normalizedEmail,
    service,
    createdAt: { $gte: windowStart }
  };

  try {
    const existing = await Lead.findOne(query).select('_id eventId createdAt').lean();
    if (existing) {
      inMemoryDeduplication.set(dedupKey, Date.now() + ttl * 1000);
      return true;
    }
  } catch (err) {
    logger.warn({ msg: 'Database duplicate check warning', error: err.message });
  }

  // Mark in memory to protect concurrent writes
  inMemoryDeduplication.set(dedupKey, Date.now() + ttl * 1000);
  return false;
}

/**
 * Persists a lead directly to MongoDB when Redis is unavailable or disabled.
 * Emulates the background worker transaction: creates lead, records timeline, creates audit log.
 */
export async function saveLeadDirectlyToDatabase(leadPayload) {
  const eventId = leadPayload.eventId || uuidv4();

  // Check if lead was already inserted
  const existing = await Lead.findOne({ eventId });
  if (existing) {
    logger.info({ msg: 'Lead already persisted in database', eventId });
    return { success: true, eventId, lead: existing, mode: 'DIRECT_DATABASE' };
  }

  const newLead = new Lead({
    eventId,
    name: leadPayload.name,
    email: leadPayload.email.toLowerCase().trim(),
    phone: leadPayload.phone || '',
    company: leadPayload.company || '',
    service: leadPayload.service,
    message: leadPayload.message,
    source: leadPayload.source || 'WEBSITE',
    status: 'NEW',
    timeline: [
      {
        event: 'LEAD_CREATED',
        performedByName: 'SYSTEM (Direct Database Mode)',
        details: 'Lead ingested directly to database (Redis queue bypassed)',
        timestamp: new Date()
      }
    ]
  });

  await newLead.save();

  // Audit log record
  await AuditLog.create({
    action: AUDIT_ACTIONS.LEAD_CREATED,
    targetType: 'LEAD',
    targetId: eventId,
    performedByName: 'SYSTEM',
    details: {
      service: leadPayload.service,
      email: leadPayload.email,
      source: leadPayload.source || 'WEBSITE',
      mode: 'DIRECT_DATABASE'
    }
  }).catch((e) => logger.warn({ msg: 'Non-fatal audit log insert issue in direct mode', error: e.message }));

  // Invalidate analytics caches
  await invalidateCachePattern('analytics:*');

  logger.info({
    msg: 'Lead persisted directly to MongoDB database',
    eventId,
    service: leadPayload.service,
    email: leadPayload.email
  });

  return {
    success: true,
    eventId,
    lead: newLead,
    mode: 'DIRECT_DATABASE'
  };
}
