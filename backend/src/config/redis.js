import Redis from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

let redisClient = null;
let connectionAttempted = false;
let isExplicitlyDisabled = false;

/**
 * Checks whether Redis connection settings are provided in the environment
 */
export function isRedisConfigured() {
  if (process.env.USE_REDIS === 'false') {
    return false;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || redisUrl.trim() === '') {
    return false;
  }

  const normalized = redisUrl.trim().toLowerCase();
  if (['disabled', 'none', 'false', 'off', 'null', 'undefined'].includes(normalized)) {
    return false;
  }

  return true;
}

/**
 * Initializes and returns the singleton Redis client if configured.
 * If Redis is NOT configured or disabled, returns null.
 */
export function getRedisClient() {
  if (!isRedisConfigured()) {
    if (!isExplicitlyDisabled) {
      logger.info({
        msg: 'Redis is not configured or disabled via environment (CRM operating in DIRECT_DATABASE mode)'
      });
      isExplicitlyDisabled = true;
    }
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '3000', 10);

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1, // Fail fast so CRM gracefully falls back to database
      enableOfflineQueue: false, // Critical: don't buffer commands when Redis is offline; fail fast to direct DB
      enableReadyCheck: true,
      connectTimeout,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 10) {
          // Cease aggressive retries; periodic health checks can re-establish
          return 10000;
        }
        const delay = Math.min(times * 500, 5000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    redisClient.on('connect', () => {
      logger.info({
        msg: 'Redis connection initiated',
        url: redisUrl.replace(/:[^:@]*@/, ':***@')
      });
    });

    redisClient.on('ready', () => {
      logger.info({ msg: 'Redis client ready for commands' });
    });

    redisClient.on('error', (err) => {
      // Prevent unhandled error event crash in Node.js
      logger.warn({
        msg: 'Redis connection error (requests will transparently use direct database mode)',
        error: err.message
      });
    });

    redisClient.on('close', () => {
      logger.warn({ msg: 'Redis connection closed' });
    });

    return redisClient;
  } catch (err) {
    logger.warn({
      msg: 'Failed to instantiate Redis client (falling back to direct database mode)',
      error: err.message
    });
    redisClient = null;
    return null;
  }
}

/**
 * Dedicated duplicate client (e.g. for blocking operations or worker consumer loops)
 * Returns null if Redis is not configured or client cannot be created.
 */
export function createDuplicateClient(options = {}) {
  if (!isRedisConfigured()) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  try {
    const duplicate = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Often needed for blocking stream commands
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: false,
      retryStrategy(times) {
        return Math.min(times * 1000, 10000);
      },
      ...options
    });

    duplicate.on('error', (err) => {
      logger.warn({ msg: 'Duplicate Redis client error', error: err.message });
    });

    return duplicate;
  } catch (err) {
    logger.warn({ msg: 'Failed to create duplicate Redis client', error: err.message });
    return null;
  }
}

/**
 * Checks if Redis is currently connected, responsive, and ready for commands.
 * Times out after 1500ms to guarantee non-blocking responsiveness.
 */
export async function isRedisHealthy() {
  if (!isRedisConfigured()) {
    return false;
  }

  const client = getRedisClient();
  if (!client || client.status !== 'ready') {
    return false;
  }

  try {
    const pingPromise = client.ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis ping timeout')), 1500)
    );

    const pong = await Promise.race([pingPromise, timeoutPromise]);
    return pong === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Returns comprehensive status info about Redis for system telemetry
 */
export async function getRedisStatus() {
  const configured = isRedisConfigured();
  if (!configured) {
    return {
      configured: false,
      status: 'DISABLED',
      mode: 'DIRECT_DATABASE',
      url: null
    };
  }

  const healthy = await isRedisHealthy();
  const client = getRedisClient();
  const rawStatus = client ? client.status : 'DISCONNECTED';

  return {
    configured: true,
    status: healthy ? 'UP' : (rawStatus.toUpperCase() || 'DOWN'),
    mode: healthy ? 'REDIS_BUFFER' : 'DIRECT_DATABASE',
    url: (process.env.REDIS_URL || '').replace(/:[^:@]*@/, ':***@')
  };
}

/**
 * Closes Redis connection cleanly
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      try {
        redisClient.disconnect();
      } catch {}
    } finally {
      redisClient = null;
      logger.info({ msg: 'Redis client closed cleanly' });
    }
  }
}
