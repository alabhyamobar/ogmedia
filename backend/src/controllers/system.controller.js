import { isDbHealthy } from '../config/db.js';
import { isRedisHealthy, getRedisClient } from '../config/redis.js';
import { getQueueMetrics } from '../queues/lead.queue.js';
import mongoose from 'mongoose';

export function getHealth(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

export async function getReadiness(req, res) {
  const dbOk = isDbHealthy();
  const redisOk = await isRedisHealthy();

  const isReady = dbOk && redisOk;

  const status = isReady ? 200 : 503;

  res.status(status).json({
    status: isReady ? 'READY' : 'NOT_READY',
    checks: {
      database: dbOk ? 'UP' : 'DOWN',
      redis: redisOk ? 'UP' : 'DOWN'
    },
    timestamp: new Date().toISOString()
  });
}

export async function getSystemHealthMetrics(req, res, next) {
  try {
    const [queueMetrics, redisUp] = await Promise.all([
      getQueueMetrics(),
      isRedisHealthy()
    ]);

    const redis = getRedisClient();
    let redisInfo = {};
    if (redisUp) {
      try {
        const rawInfo = await redis.info('memory');
        const memoryMatch = rawInfo.match(/used_memory_human:(.*)/);
        if (memoryMatch) {
          redisInfo.usedMemory = memoryMatch[1].trim();
        }
      } catch {}
    }

    const dbStats = {
      status: isDbHealthy() ? 'UP' : 'DOWN',
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      host: mongoose.connection.host
    };

    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      success: true,
      data: {
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryUsage: {
            heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
          }
        },
        database: dbStats,
        redis: {
          status: redisUp ? 'UP' : 'DOWN',
          ...redisInfo
        },
        queue: queueMetrics
      },
      requestId: req.id
    });
  } catch (error) {
    next(error);
  }
}
