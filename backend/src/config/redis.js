import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let redisClient = null;
let redisSubscriber = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 5000,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
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
    logger.info({ msg: 'Redis connection established', url: redisUrl.replace(/:[^:@]*@/, ':***@') });
  });

  redisClient.on('ready', () => {
    logger.info({ msg: 'Redis client ready for commands' });
  });

  redisClient.on('error', (err) => {
    logger.error({ msg: 'Redis connection error', error: err.message });
  });

  redisClient.on('close', () => {
    logger.warn({ msg: 'Redis connection closed' });
  });

  return redisClient;
}

/**
 * Dedicated duplicate client (e.g. for blocking operations or worker consumer loops)
 */
export function createDuplicateClient(options = {}) {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Often needed for blocking stream commands
    ...options
  });
}

export async function isRedisHealthy() {
  if (!redisClient) return false;
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info({ msg: 'Redis client closed gracefully' });
  }
}
