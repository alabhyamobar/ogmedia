import { v4 as uuidv4 } from 'uuid';
import { createDuplicateClient, getRedisClient, isRedisHealthy } from '../config/redis.js';
import { connectDB } from '../config/db.js';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { FailedLeadEvent } from '../models/FailedLeadEvent.js';
import { QUEUE_CONFIG, AUDIT_ACTIONS } from '../constants/index.js';
import { enqueueToDLQ, initLeadQueue } from '../queues/lead.queue.js';
import { invalidateCachePattern } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

let isWorkerRunning = false;
let shouldStop = false;
let reconnectSupervisorTimer = null;

/**
 * Parses raw Redis Stream entries into typed objects
 * Raw format from XREADGROUP:
 * [ [ streamName, [ [ messageId, [ 'field1', 'val1', 'field2', 'val2' ] ], ... ] ] ]
 */
function parseStreamEntries(streamData) {
  if (!streamData || streamData.length === 0) return [];
  const entries = [];

  for (const [streamName, messages] of streamData) {
    for (const [messageId, fieldArray] of messages) {
      const fields = {};
      for (let i = 0; i < fieldArray.length; i += 2) {
        fields[fieldArray[i]] = fieldArray[i + 1];
      }

      let payload = {};
      try {
        payload = typeof fields.payload === 'string' ? JSON.parse(fields.payload) : fields.payload || {};
      } catch (e) {
        logger.error({ msg: 'Malformed payload in stream message', messageId, error: e.message });
      }

      entries.push({
        streamName,
        messageId,
        eventId: fields.eventId || uuidv4(),
        eventType: fields.eventType || 'LEAD_CREATED',
        timestamp: fields.timestamp || new Date().toISOString(),
        retryCount: parseInt(fields.retryCount || '0', 10),
        payload
      });
    }
  }

  return entries;
}

/**
 * Invalidates analytics caches when new leads are inserted
 */
async function invalidateAnalyticsCache() {
  await invalidateCachePattern('analytics:*');
}

/**
 * Processes a batch of parsed lead events with MongoDB bulkWrite
 */
async function processBatch(redisConsumer, batch) {
  if (batch.length === 0) return;

  const maxRetries = parseInt(process.env.QUEUE_MAX_RETRIES || `${QUEUE_CONFIG.MAX_RETRIES}`, 10);
  const bulkOps = [];
  const validBatchItems = [];

  for (const item of batch) {
    if (!item.payload || !item.payload.email || !item.payload.name) {
      logger.warn({ msg: 'Skipping invalid lead payload', item });
      // Send directly to DLQ
      await enqueueToDLQ(item, 'Missing required lead fields (email or name)');
      if (redisConsumer) {
        await redisConsumer.xack(QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP, item.messageId).catch(() => {});
      }
      continue;
    }

    bulkOps.push({
      updateOne: {
        filter: { eventId: item.eventId },
        update: {
          $setOnInsert: {
            eventId: item.eventId,
            name: item.payload.name,
            email: item.payload.email,
            phone: item.payload.phone || '',
            company: item.payload.company || '',
            service: item.payload.service,
            message: item.payload.message,
            source: item.payload.source || 'WEBSITE',
            status: 'NEW',
            timeline: [
              {
                event: 'LEAD_CREATED',
                performedByName: 'SYSTEM (Ingestion Worker)',
                details: 'Lead ingested via public contact form buffer',
                timestamp: new Date()
              }
            ]
          }
        },
        upsert: true
      }
    });

    validBatchItems.push(item);
  }

  if (bulkOps.length === 0) return;

  try {
    // Controlled batch write to MongoDB
    const result = await Lead.bulkWrite(bulkOps, { ordered: false });

    logger.info({
      msg: 'Batch written to MongoDB successfully',
      batchSize: bulkOps.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });

    // Create audit log records and acknowledge in Redis
    const ackMessageIds = [];
    const auditEntries = [];

    for (const item of validBatchItems) {
      ackMessageIds.push(item.messageId);

      auditEntries.push({
        action: AUDIT_ACTIONS.LEAD_CREATED,
        targetType: 'LEAD',
        targetId: item.eventId,
        performedByName: 'SYSTEM',
        details: {
          service: item.payload.service,
          email: item.payload.email,
          source: item.payload.source || 'WEBSITE'
        }
      });
    }

    // Insert audit entries
    if (auditEntries.length > 0) {
      await AuditLog.insertMany(auditEntries, { ordered: false }).catch((e) =>
        logger.warn({ msg: 'Non-fatal audit log bulk insert issue', error: e.message })
      );
    }

    // Safely acknowledge messages in Redis Stream
    if (redisConsumer && ackMessageIds.length > 0) {
      await redisConsumer.xack(QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP, ...ackMessageIds).catch((e) =>
        logger.warn({ msg: 'Failed to acknowledge messages in Redis stream', error: e.message })
      );
    }

    // Invalidate analytics caches
    await invalidateAnalyticsCache();
  } catch (error) {
    logger.error({
      msg: 'MongoDB bulkWrite error during worker batch',
      error: error.message
    });

    // Handle individual item failure & exponential backoff / DLQ
    for (const item of validBatchItems) {
      const nextRetryCount = item.retryCount + 1;

      if (nextRetryCount > maxRetries) {
        // Exceeded retries -> persist to DLQ in MongoDB & Redis
        logger.error({
          msg: 'Lead event exceeded max retries, moving to DLQ',
          eventId: item.eventId,
          retries: nextRetryCount
        });

        await FailedLeadEvent.findOneAndUpdate(
          { eventId: item.eventId },
          {
            eventId: item.eventId,
            payload: item.payload,
            error: error.message,
            retryCount: nextRetryCount,
            failedAt: new Date()
          },
          { upsert: true }
        ).catch((dlqErr) => logger.error({ msg: 'Failed to write DLQ to Mongo', error: dlqErr.message }));

        await enqueueToDLQ(item, error.message);
        if (redisConsumer) {
          await redisConsumer.xack(QUEUE_CONFIG.STREAM_NAME, QUEUE_CONFIG.CONSUMER_GROUP, item.messageId).catch(() => {});
        }
      } else {
        logger.warn({
          msg: 'Scheduling retry for lead event',
          eventId: item.eventId,
          attempt: nextRetryCount,
          maxRetries
        });
        const backoffMs = Math.min(Math.pow(2, nextRetryCount) * 500, 10000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
}

/**
 * Recovers stuck unacknowledged messages (e.g. from crashed worker nodes)
 */
async function recoverPendingMessages(redisConsumer, workerName) {
  if (!redisConsumer) return;
  try {
    const pendingList = await redisConsumer.xpending(
      QUEUE_CONFIG.STREAM_NAME,
      QUEUE_CONFIG.CONSUMER_GROUP,
      '-',
      '+',
      50
    );

    if (!pendingList || pendingList.length === 0) return;

    for (const item of pendingList) {
      const [msgId, consumer, idleTimeMs, deliveryCount] = item;
      if (idleTimeMs > 30000) {
        logger.info({
          msg: 'Claiming stale unacknowledged message from crashed consumer',
          messageId: msgId,
          prevConsumer: consumer,
          idleTimeMs
        });

        const claimed = await redisConsumer.xclaim(
          QUEUE_CONFIG.STREAM_NAME,
          QUEUE_CONFIG.CONSUMER_GROUP,
          workerName,
          30000,
          msgId
        );

        if (claimed && claimed.length > 0) {
          const parsed = parseStreamEntries([[QUEUE_CONFIG.STREAM_NAME, claimed]]);
          await processBatch(redisConsumer, parsed);
        }
      }
    }
  } catch (err) {
    logger.debug({ msg: 'Pending message recovery check note', detail: err.message });
  }
}

/**
 * Main worker loop with controlled batching and concurrency
 */
export async function startLeadWorker(options = {}) {
  if (isWorkerRunning) {
    logger.debug({ msg: 'Worker loop already running' });
    return;
  }

  // Check Redis availability before starting
  const redisUp = await isRedisHealthy();
  if (!redisUp) {
    logger.info({
      msg: 'Lead worker consumer standing by: Redis is unavailable or unconfigured. Ingestion operates in DIRECT_DATABASE mode.'
    });

    // Start background reconnection supervisor to auto-start if Redis comes online
    if (!reconnectSupervisorTimer && !shouldStop) {
      reconnectSupervisorTimer = setInterval(async () => {
        if (shouldStop) {
          clearInterval(reconnectSupervisorTimer);
          reconnectSupervisorTimer = null;
          return;
        }
        const nowHealthy = await isRedisHealthy();
        if (nowHealthy && !isWorkerRunning) {
          logger.info({ msg: 'Redis is now healthy. Launching lead worker consumer stream...' });
          clearInterval(reconnectSupervisorTimer);
          reconnectSupervisorTimer = null;
          startLeadWorker(options);
        }
      }, 15000);
    }
    return;
  }

  isWorkerRunning = true;
  shouldStop = false;

  const workerId = options.workerId || `worker-${process.pid}-${Math.floor(Math.random() * 1000)}`;
  const concurrency = parseInt(process.env.LEAD_WORKER_CONCURRENCY || '20', 10);
  const batchSize = Math.min(concurrency, QUEUE_CONFIG.DEFAULT_BATCH_SIZE);

  logger.info({
    msg: 'Starting lead worker consumer',
    workerId,
    batchSize,
    concurrency
  });

  await initLeadQueue();
  const redisConsumer = createDuplicateClient();
  if (!redisConsumer) {
    isWorkerRunning = false;
    return;
  }

  // Recovery check interval (runs every 60s)
  const recoveryInterval = setInterval(() => {
    recoverPendingMessages(redisConsumer, workerId);
  }, 60000);

  // Initial recovery check
  await recoverPendingMessages(redisConsumer, workerId);

  // Main polling loop
  (async () => {
    while (!shouldStop) {
      try {
        const streamData = await redisConsumer.xreadgroup(
          'GROUP',
          QUEUE_CONFIG.CONSUMER_GROUP,
          workerId,
          'COUNT',
          batchSize,
          'BLOCK',
          2000,
          'STREAMS',
          QUEUE_CONFIG.STREAM_NAME,
          '>'
        );

        if (streamData && streamData.length > 0) {
          const batch = parseStreamEntries(streamData);
          if (batch.length > 0) {
            await processBatch(redisConsumer, batch);
          }
        }
      } catch (error) {
        if (shouldStop) break;
        logger.warn({ msg: 'Worker polling loop warning', error: error.message });

        if (error.message && error.message.includes('NOGROUP')) {
          logger.info({ msg: 'Detected missing stream or group, re-initializing consumer group...' });
          await initLeadQueue();
        }

        // If Redis disconnected, backoff and check health
        const healthy = await isRedisHealthy();
        if (!healthy) {
          logger.warn({ msg: 'Redis connection lost in worker loop, waiting to reconnect...' });
          await new Promise((r) => setTimeout(r, 5000));
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    clearInterval(recoveryInterval);
    try {
      await redisConsumer.quit();
    } catch {}
    isWorkerRunning = false;
    logger.info({ msg: 'Lead worker consumer stopped cleanly', workerId });
  })();
}

export function stopLeadWorker() {
  shouldStop = true;
  if (reconnectSupervisorTimer) {
    clearInterval(reconnectSupervisorTimer);
    reconnectSupervisorTimer = null;
  }
}

// Standalone execution if launched via `node src/workers/lead.worker.js`
if (process.argv[1] && process.argv[1].endsWith('lead.worker.js')) {
  (async () => {
    try {
      await connectDB();
      await startLeadWorker();

      const shutdown = async () => {
        logger.info({ msg: 'Shutting down standalone worker...' });
        stopLeadWorker();
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    } catch (err) {
      logger.error({ msg: 'Failed to start standalone worker', error: err.message });
      process.exit(1);
    }
  })();
}
