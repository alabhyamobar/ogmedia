import { getRedisClient, isRedisHealthy } from '../config/redis.js';
import { logger } from './logger.js';

// In-memory fallback cache for when Redis is disabled/offline
const memoryCache = new Map();
const MEMORY_CACHE_MAX_ITEMS = 500;

function cleanupExpiredMemoryCache() {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Retrieve cached value by key.
 * Transparently checks Redis first if available; falls back to in-memory cache.
 * Returns parsed object, string, or null on cache miss / error.
 */
export async function getCache(key) {
  try {
    const redisUp = await isRedisHealthy();
    if (redisUp) {
      const redis = getRedisClient();
      if (redis) {
        const raw = await redis.get(key);
        if (raw !== null && raw !== undefined) {
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
      }
    }
  } catch (err) {
    logger.debug({ msg: 'Redis cache get failed, checking memory fallback', key, error: err.message });
  }

  // Memory fallback
  const item = memoryCache.get(key);
  if (item) {
    if (!item.expiresAt || item.expiresAt > Date.now()) {
      return item.value;
    }
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Stores a value in cache with a TTL (in seconds).
 * Writes to Redis if healthy, otherwise stores in memory cache.
 */
export async function setCache(key, value, ttlSeconds = 300) {
  try {
    const redisUp = await isRedisHealthy();
    if (redisUp) {
      const redis = getRedisClient();
      if (redis) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await redis.set(key, serialized, 'EX', ttlSeconds);
        return true;
      }
    }
  } catch (err) {
    logger.debug({ msg: 'Redis cache set failed, storing in memory cache', key, error: err.message });
  }

  // Memory cache fallback with LRU-like eviction
  if (memoryCache.size >= MEMORY_CACHE_MAX_ITEMS) {
    cleanupExpiredMemoryCache();
    if (memoryCache.size >= MEMORY_CACHE_MAX_ITEMS) {
      const oldestKey = memoryCache.keys().next().value;
      if (oldestKey) memoryCache.delete(oldestKey);
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });

  return true;
}

/**
 * Deletes a single key from cache
 */
export async function delCache(key) {
  memoryCache.delete(key);
  try {
    const redisUp = await isRedisHealthy();
    if (redisUp) {
      const redis = getRedisClient();
      if (redis) {
        await redis.del(key);
      }
    }
  } catch (err) {
    logger.debug({ msg: 'Redis cache del failed', key, error: err.message });
  }
}

/**
 * Invalidates all keys matching a given pattern (e.g. 'analytics:*')
 */
export async function invalidateCachePattern(pattern) {
  // Clear memory cache keys that match
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }

  try {
    const redisUp = await isRedisHealthy();
    if (redisUp) {
      const redis = getRedisClient();
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          logger.debug({ msg: 'Cache keys invalidated in Redis', pattern, count: keys.length });
        }
      }
    }
  } catch (err) {
    logger.debug({ msg: 'Redis pattern invalidation failed (non-critical)', pattern, error: err.message });
  }
}
