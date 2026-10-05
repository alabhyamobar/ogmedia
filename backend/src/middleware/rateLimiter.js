import rateLimit, { MemoryStore } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConfigured, isRedisHealthy } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Resilient Rate Limiter Store:
 * Attempts to use Redis for distributed rate-limiting when Redis is connected and healthy.
 * Seamlessly falls back to express-rate-limit's in-memory store if Redis is absent, offline, or throwing errors.
 */
class AdaptableRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.memoryStore = new MemoryStore();
    this.redisStore = null;
    this.options = null;
    this.initAttempted = false;
  }

  init(options) {
    this.options = options;
    this.memoryStore.init(options);
  }

  async getActiveRedisStore() {
    if (!isRedisConfigured()) {
      return null;
    }

    const healthy = await isRedisHealthy();
    if (!healthy) {
      this.redisStore = null;
      this.initAttempted = false;
      return null;
    }

    if (this.redisStore) {
      return this.redisStore;
    }

    if (!this.initAttempted) {
      this.initAttempted = true;
      try {
        const client = getRedisClient();
        if (client) {
          const store = new RedisStore({
            // @ts-expect-error - ioredis sendCommand compatibility
            sendCommand: async (...args) => {
              const isUp = await isRedisHealthy();
              if (!isUp) {
                throw new Error('Redis offline in rate limiter');
              }
              return client.call(...args);
            },
            prefix: `rl:${this.prefix}:`
          });

          if (typeof store.init === 'function' && this.options) {
            await store.init(this.options).catch((err) => {
              logger.debug({ msg: 'RedisStore init script load warning', error: err.message });
            });
          }

          this.redisStore = store;
          return this.redisStore;
        }
      } catch (err) {
        logger.debug({
          msg: 'Failed to initialize Redis rate limit store, using memory',
          prefix: this.prefix,
          error: err.message
        });
        this.redisStore = null;
      }
    }

    return this.redisStore;
  }

  async increment(key) {
    const store = await this.getActiveRedisStore();
    if (store) {
      try {
        return await store.increment(key);
      } catch (err) {
        logger.debug({
          msg: 'Redis rate limit increment error, falling back to memory store',
          prefix: this.prefix,
          error: err.message
        });
      }
    }
    return await this.memoryStore.increment(key);
  }

  async decrement(key) {
    const store = await this.getActiveRedisStore();
    if (store) {
      try {
        return await store.decrement(key);
      } catch (err) {
        logger.debug({
          msg: 'Redis rate limit decrement error, falling back to memory store',
          prefix: this.prefix,
          error: err.message
        });
      }
    }
    return await this.memoryStore.decrement(key);
  }

  async resetKey(key) {
    const store = await this.getActiveRedisStore();
    if (store) {
      try {
        await store.resetKey(key);
      } catch {}
    }
    return await this.memoryStore.resetKey(key);
  }

  async resetAll() {
    const store = await this.getActiveRedisStore();
    if (store) {
      try {
        await store.resetAll();
      } catch {}
    }
    return await this.memoryStore.resetAll();
  }

  async shutdown() {
    if (this.redisStore && typeof this.redisStore.shutdown === 'function') {
      try {
        await this.redisStore.shutdown();
      } catch {}
    }
    return await this.memoryStore.shutdown();
  }
}

/**
 * Public Contact Form Rate Limiter
 * Strict: 15 submissions per 15 minutes per IP
 */
export const publicLeadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skip: () => process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true',
  standardHeaders: true,
  legacyHeaders: false,
  store: new AdaptableRateLimitStore('public_leads'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many submissions from this connection. Please try again after 15 minutes.'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn({ msg: 'Public contact form rate limit exceeded', ip: req.ip });
    res.status(429).json(options.message);
  }
});

/**
 * Authentication Login Rate Limiter
 * Very Strict: 5 login attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  skip: () => process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true',
  standardHeaders: true,
  legacyHeaders: false,
  store: new AdaptableRateLimitStore('login'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts. Account temporarily locked for 15 minutes.'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn({ msg: 'Login rate limit exceeded', ip: req.ip, login: req.body?.login });
    res.status(429).json(options.message);
  }
});

/**
 * General Authenticated API Rate Limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: new AdaptableRateLimitStore('api'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'API rate limit exceeded. Please slow down.'
    }
  }
});
