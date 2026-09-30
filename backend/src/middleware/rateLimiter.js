import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

function createRedisStore(prefix) {
  try {
    const client = getRedisClient();
    return new RedisStore({
      // @ts-expect-error - ioredis sendCommand compatibility
      sendCommand: (...args) => client.call(...args),
      prefix: `rl:${prefix}:`
    });
  } catch (err) {
    logger.warn({ msg: 'Using memory store fallback for rate limiter', prefix, error: err.message });
    return undefined; // Falls back to default express-rate-limit memory store
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
  store: createRedisStore('public_leads'),
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
  store: createRedisStore('login'),
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
  store: createRedisStore('api'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'API rate limit exceeded. Please slow down.'
    }
  }
});
