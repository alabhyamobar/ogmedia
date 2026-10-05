import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient, isRedisHealthy } from '../config/redis.js';
import { QUEUE_CONFIG } from '../constants/index.js';
import { saveLeadDirectlyToDatabase, checkDuplicateInDatabase } from '../services/leadPersistence.service.js';
import { logger } from '../utils/logger.js';

/**
 * Initializes the Redis Stream consumer group if Redis is configured and healthy.
 * If Redis is unavailable or unconfigured, skips gracefully without throwing.
 */
export async function initLeadQueue() {
  const healthy = await isRedisHealthy();
  if (!healthy) {
    logger.info({
      msg: 'Redis Stream consumer group initialization skipped (operating in DIRECT_DATABASE mode)',
      stream: QUEUE_CONFIG.STREAM_NAME,
      group: QUEUE_CONFIG.CONSUMER_GROUP
    });
    return;
  }

  const redis = getRedisClient();
  if (!redis) return;

  try {
    // MKSTREAM automatically creates the stream if it does not exist
    await redis.xgroup('CREATE', QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP, '$', 'MKSTREAM');
    logger.info({
      msg: 'Redis Stream consumer group initialized',
      stream: QUEUE_CONFIG.STREAM_NAME,
      group: QUEUE_CONFIG.CONSUMER_GROUP
    });
  } catch (err) {
    if (err.message && err.message.includes('BUSYGROUP')) {
      // Group already exists, which is normal on server restarts
      logger.debug({ msg: 'Consumer group already exists', group: QUEUE_CONFIG.CONSUMER_GROUP });
    } else {
      logger.warn({ msg: 'Failed to create Redis consumer group (falling back to direct DB mode)', error: err.message });
    }
  }
}

/**
 * Computes a deterministic deduplication hash for a lead submission
 */
export function computeLeadHash(email, phone, service) {
  const normalized = `${(email || '').toLowerCase().trim()}:${(phone || '').trim()}:${service}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Checks if a submission is a duplicate within the configured time window.
 * Returns true if duplicate, false if new.
 * Adaptable: utilizes Redis SET NX if healthy, otherwise checks MongoDB.
 */
export async function checkAndSetDuplicate(email, phone, service, eventId) {
  const ttl = parseInt(process.env.LEAD_DUPLICATE_WINDOW_SECONDS || `${QUEUE_CONFIG.DUPLICATE_WINDOW_SECONDS}`, 10);

  const redisUp = await isRedisHealthy();
  if (redisUp) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const hash = computeLeadHash(email, phone, service);
        const dedupKey = `dedup:lead:${hash}`;

        // SET NX with EX ensures atomic check-and-set
        const result = await redis.set(dedupKey, eventId || 'dedup', 'EX', ttl, 'NX');
        return result === null; // If result is null, key already existed (duplicate!)
      }
    } catch (err) {
      logger.warn({ msg: 'Redis deduplication check failed, falling back to database check', error: err.message });
    }
  }

  // Fallback to database check
  return await checkDuplicateInDatabase(email, phone, service, ttl);
}

/**
 * Appends a lead submission event to the Redis Stream if available.
 * If Redis is not available or connection is failing, saves directly to MongoDB!
 * Returns { eventId, streamMessageId, mode } on success.
 */
export async function enqueueLeadSubmission(leadPayload) {
  const eventId = leadPayload.eventId || uuidv4();
  const redisUp = await isRedisHealthy();

  if (redisUp) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const event = {
          eventId,
          eventType: 'LEAD_CREATED',
          timestamp: new Date().toISOString(),
          retryCount: 0,
          payload: JSON.stringify({
            name: leadPayload.name,
            email: leadPayload.email,
            phone: leadPayload.phone || '',
            company: leadPayload.company || '',
            service: leadPayload.service,
            message: leadPayload.message,
            source: leadPayload.source || 'WEBSITE'
          })
        };

        const streamMessageId = await redis.xadd(
          QUEUE_CONFIG.STREAM_NAME,
          '*',
          'eventId',
          event.eventId,
          'eventType',
          event.eventType,
          'timestamp',
          event.timestamp,
          'retryCount',
          event.retryCount.toString(),
          'payload',
          event.payload
        );

        logger.info({
          msg: 'Lead successfully queued to Redis Stream',
          eventId,
          streamMessageId,
          service: leadPayload.service
        });

        return { eventId, streamMessageId, mode: 'REDIS_BUFFER' };
      }
    } catch (err) {
      logger.warn({
        msg: 'Failed to enqueue to Redis stream, falling back to direct database insertion',
        eventId,
        error: err.message
      });
    }
  }

  // Fallback to direct MongoDB persistence
  const directResult = await saveLeadDirectlyToDatabase({
    eventId,
    ...leadPayload
  });

  return {
    eventId: directResult.eventId,
    streamMessageId: null,
    mode: 'DIRECT_DATABASE'
  };
}

/**
 * Writes an event to the Dead Letter Queue stream in Redis if available
 */
export async function enqueueToDLQ(eventData, errorReason) {
  const redisUp = await isRedisHealthy();
  if (redisUp) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const dlqMessageId = await redis.xadd(
          QUEUE_CONFIG.DLQ_STREAM_NAME,
          '*',
          'eventId',
          eventData.eventId,
          'payload',
          typeof eventData.payload === 'string' ? eventData.payload : JSON.stringify(eventData.payload),
          'retryCount',
          (eventData.retryCount || 0).toString(),
          'error',
          errorReason || 'Unknown error',
          'failedAt',
          new Date().toISOString()
        );

        logger.warn({
          msg: 'Event sent to Dead Letter Queue',
          eventId: eventData.eventId,
          dlqMessageId,
          error: errorReason
        });

        return dlqMessageId;
      }
    } catch (err) {
      logger.warn({ msg: 'Failed to write to Redis DLQ', error: err.message });
    }
  }

  return null;
}

/**
 * Returns real-time health and depth metrics for queue monitoring.
 * Returns DIRECT_DATABASE mode metrics when Redis is absent.
 */
export async function getQueueMetrics() {
  const redisUp = await isRedisHealthy();
  if (!redisUp) {
    return {
      status: 'DISABLED',
      mode: 'DIRECT_DATABASE',
      message: 'Queue disabled; CRM interacting directly with database',
      queueLength: 0,
      pendingCount: 0,
      dlqLength: 0,
      oldestMessageAgeSeconds: 0,
      streamName: QUEUE_CONFIG.STREAM_NAME,
      consumerGroup: QUEUE_CONFIG.CONSUMER_GROUP
    };
  }

  try {
    const redis = getRedisClient();
    const [queueLength, dlqLength, pendingInfo] = await Promise.all([
      redis.xlen(QUEUE_CONFIG.STREAM_NAME),
      redis.xlen(QUEUE_CONFIG.DLQ_STREAM_NAME).catch(() => 0),
      redis.xpending(QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP).catch(() => [0, null, null, []])
    ]);

    let oldestMessageAgeSeconds = 0;
    try {
      const oldestEntry = await redis.xrange(QUEUE_CONFIG.STREAM_NAME, '-', '+', 'COUNT', 1);
      if (oldestEntry && oldestEntry.length > 0) {
        const streamId = oldestEntry[0][0];
        const timestampMs = parseInt(streamId.split('-')[0], 10);
        if (!isNaN(timestampMs)) {
          oldestMessageAgeSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
        }
      }
    } catch {}

    const pendingCount = pendingInfo && typeof pendingInfo[0] === 'number' ? pendingInfo[0] : 0;

    return {
      status: 'HEALTHY',
      mode: 'REDIS_BUFFER',
      queueLength,
      pendingCount,
      dlqLength,
      oldestMessageAgeSeconds,
      streamName: QUEUE_CONFIG.STREAM_NAME,
      consumerGroup: QUEUE_CONFIG.CONSUMER_GROUP
    };
  } catch (error) {
    logger.warn({ msg: 'Failed to retrieve queue metrics', error: error.message });
    return {
      status: 'DEGRADED',
      mode: 'DIRECT_DATABASE',
      error: error.message,
      queueLength: 0,
      pendingCount: 0,
      dlqLength: 0
    };
  }
}
