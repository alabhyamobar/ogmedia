import http from 'http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { getRedisClient, closeRedis, isRedisConfigured, isRedisHealthy } from './config/redis.js';
import { initLeadQueue } from './queues/lead.queue.js';
import { startLeadWorker, stopLeadWorker } from './workers/lead.worker.js';
import { logger } from './utils/logger.js';

import { User } from './models/User.js';
import { ROLES, SERVICES } from './constants/index.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

async function ensureDeveloperAccount() {
  try {
    const existingDev = await User.findOne({ username: 'developer' });
    if (!existingDev) {
      const passwordHash = await User.hashPassword('DevPass2026!@');
      await User.create({
        name: 'Lead System Developer',
        username: 'developer',
        email: 'developer@ogmedia.agency',
        passwordHash,
        role: ROLES.DEVELOPER,
        expertise: Object.values(SERVICES),
        status: 'ACTIVE',
        mustChangePassword: false
      });
      logger.info({ msg: 'Developer account auto-enrolled: @developer / DevPass2026!@' });
    }

    // Remove legacy superadmin account if present
    await User.deleteOne({ username: 'superadmin' });
  } catch (err) {
    logger.warn({ msg: 'Could not verify developer account', error: err.message });
  }
}

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    await ensureDeveloperAccount();

    // 2. Initialize Redis and Stream Queue (Adaptable: only if configured and healthy)
    if (isRedisConfigured()) {
      getRedisClient();
      const redisUp = await isRedisHealthy();
      if (redisUp) {
        await initLeadQueue();
        logger.info({ msg: 'CRM running in REDIS_BUFFER mode (queue buffering active)' });
      } else {
        logger.warn({
          msg: 'Redis configured but currently unavailable. CRM running in DIRECT_DATABASE mode (falling back to direct MongoDB interactions)'
        });
      }
    } else {
      logger.info({
        msg: 'Redis connection string not provided or disabled. CRM running in DIRECT_DATABASE mode (interacting directly with MongoDB)'
      });
    }

    // 3. Create Express app and HTTP server
    const app = createApp();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info({
        msg: `OG Media CRM Backend Server listening on port ${PORT}`,
        environment: process.env.NODE_ENV || 'development',
        port: PORT
      });
    });

    // 4. In development / single-instance deployments, start the worker in-process
    // In distributed production setups, workers can also run as independent processes via `npm run worker`
    const shouldStartInProcessWorker = process.env.START_IN_PROCESS_WORKER !== 'false';
    if (shouldStartInProcessWorker) {
      logger.info({ msg: 'Starting background lead worker in-process' });
      startLeadWorker({ workerId: `in-process-${process.pid}` });
    }

    // 5. Graceful Shutdown Handlers
    const gracefulShutdown = async (signal) => {
      logger.info({ msg: `Received ${signal}, initiating graceful shutdown...` });

      // Stop worker polling loop
      if (shouldStartInProcessWorker) {
        stopLeadWorker();
      }

      // Close HTTP server
      server.close(async () => {
        logger.info({ msg: 'HTTP server closed' });

        try {
          // Disconnect DB & Redis
          await disconnectDB();
          await closeRedis();
          logger.info({ msg: 'All connections closed cleanly. Exiting process.' });
          process.exit(0);
        } catch (err) {
          logger.error({ msg: 'Error during graceful shutdown', error: err.message });
          process.exit(1);
        }
      });

      // Force exit if not closed within 10 seconds
      setTimeout(() => {
        logger.error({ msg: 'Forced shutdown after timeout' });
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return { server, app };
  } catch (error) {
    logger.fatal({ msg: 'Failed to start server', error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
