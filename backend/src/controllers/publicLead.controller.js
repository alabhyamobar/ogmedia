import { contactLeadSchema } from '../validators/index.js';
import { enqueueLeadSubmission, checkAndSetDuplicate } from '../queues/lead.queue.js';
import { isRedisHealthy } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export async function submitContactLead(req, res, next) {
  try {
    // 1. Validate payload
    const validatedData = contactLeadSchema.parse(req.body);

    // 2. Honeypot check for bots
    if (validatedData.honeypot && validatedData.honeypot.trim() !== '') {
      logger.warn({ msg: 'Bot trapped via honeypot field', ip: req.ip });
      // Return benign success response without doing any work
      return res.status(200).json({
        success: true,
        message: 'Your query has been received.',
        requestId: req.id
      });
    }

    // 3. Verify Redis is healthy before attempting queue insertion
    // "If Redis is unavailable, do NOT send unlimited direct writes to MongoDB. Return 503 Service Unavailable"
    const redisUp = await isRedisHealthy();
    if (!redisUp) {
      logger.error({
        msg: 'Redis ingestion buffer unavailable - rejecting public submission gracefully to protect database',
        ip: req.ip
      });

      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Our message ingestion system is undergoing brief maintenance. Please try again in a few moments.'
        },
        requestId: req.id
      });
    }

    // 4. Duplicate / Idempotency check within time window
    const isDuplicate = await checkAndSetDuplicate(
      validatedData.email,
      validatedData.phone,
      validatedData.service
    );

    if (isDuplicate) {
      logger.info({
        msg: 'Duplicate lead submission detected within window',
        email: validatedData.email,
        service: validatedData.service,
        ip: req.ip
      });

      // Acknowledge gracefully so the client knows it was received without duplicating queue load
      return res.status(200).json({
        success: true,
        message: 'Your query has been received and is already being processed.',
        requestId: req.id,
        isDuplicate: true
      });
    }

    // 5. Enqueue submission to Redis Stream
    const { eventId, streamMessageId } = await enqueueLeadSubmission({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      company: validatedData.company,
      service: validatedData.service,
      message: validatedData.message,
      source: 'WEBSITE'
    });

    // 6. Fast acknowledgement - return 200 after Redis confirmed insertion
    return res.status(200).json({
      success: true,
      message: 'Your query has been received.',
      requestId: req.id,
      eventId
    });
  } catch (error) {
    next(error);
  }
}
