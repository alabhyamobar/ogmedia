import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/redis.js';
import { QUEUE_CONFIG } from '../constants/index.js';
import { logger } from '../utils/logger.js';

/**
 * Initializes the Redis Stream consumer group if it doesn't already exist.
 */
export async function initLeadQueue() {
  const redis = getRedisClient();
  try {
    // MKSTREAM automatically creates the stream if it does not exist
    await redis.xgroup('CREATE', QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP, '$', 'MKSTREAM');
    logger.info({
      msg: 'Redis Stream consumer group initialized',
      stream: QUEUE_CONFIG.STREAM_NAME,
      group: QUEUE_CONFIG.CONSUMER_GROUP
    });
  } catch (err) {
    if (err.message.includes('BUSYGROUP')) {
      // Group already exists, which is normal on server restarts
      logger.debug({ msg: 'Consumer group already exists', group: QUEUE_CONFIG.CONSUMER_GROUP });
    } else {
      logger.error({ msg: 'Failed to create consumer group', error: err.message });
      throw err;
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
 */
export async function checkAndSetDuplicate(email, phone, service, eventId) {
  const redis = getRedisClient();
  const hash = computeLeadHash(email, phone, service);
  const dedupKey = `dedup:lead:${hash}`;
  const ttl = parseInt(process.env.LEAD_DUPLICATE_WINDOW_SECONDS || `${QUEUE_CONFIG.DUPLICATE_WINDOW_SECONDS}`, 10);

  // SET NX with EX ensures atomic check-and-set
  const result = await redis.set(dedupKey, eventId, 'EX', ttl, 'NX');
  return result === null; // If result is null, key already existed (duplicate!)
}

/**
 * Appends a lead submission event to the Redis Stream.
 * Returns { eventId, streamMessageId } on success.
 * Throws error if Redis rejects or fails.
 */
export async function enqueueLeadSubmission(leadPayload) {
  const redis = getRedisClient();

  const eventId = leadPayload.eventId || uuidv4();
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

  // Write to Redis Stream using XADD
  // Arguments: XADD streamName * field1 value1 field2 value2 ...
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

  return { eventId, streamMessageId };
}

/**
 * Writes an event to the Dead Letter Queue stream in Redis
 */
export async function enqueueToDLQ(eventData, errorReason) {
  const redis = getRedisClient();
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

/**
 * Returns real-time health and depth metrics for queue monitoring
 */
export async function getQueueMetrics() {
  const redis = getRedisClient();

  try {
    const [queueLength, dlqLength, pendingInfo] = await Promise.all([
      redis.xlen(QUEUE_CONFIG.STREAM_NAME),
      redis.xlen(QUEUE_CONFIG.DLQ_STREAM_NAME).catch(() => 0),
      redis.xpending(QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP).catch(() => [0, null, null, []])
    ]);

    let oldestMessageAgeSeconds = 0;
    try {
      // Read earliest message in stream to calculate age
      const oldestEntry = await redis.xrange(QUEUE_CONFIG.STREAM_NAME, '-', '+', 'COUNT', 1);
      if (oldestEntry && oldestEntry.length > 0) {
        const streamId = oldestEntry[0][0]; // format: timestamp-sequence
        const timestampMs = parseInt(streamId.split('-')[0], 10);
        if (!isNaN(timestampMs)) {
          oldestMessageAgeSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
        }
      }
    } catch {
      // Stream may be empty
    }

    const pendingCount = pendingInfo && typeof pendingInfo[0] === 'number' ? pendingInfo[0] : 0;

    return {
      status: 'HEALTHY',
      queueLength,
      pendingCount,
      dlqLength,
      oldestMessageAgeSeconds,
      streamName: QUEUE_CONFIG.STREAM_NAME,
      consumerGroup: QUEUE_CONFIG.CONSUMER_GROUP
    };
  } catch (error) {
    logger.error({ msg: 'Failed to retrieve queue metrics', error: error.message });
    return {
      status: 'DEGRADED',
      error: error.message,
      queueLength: -1,
      pendingCount: -1,
      dlqLength: -1
    };
  }
}
