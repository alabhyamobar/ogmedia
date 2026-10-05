import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

let isConnected = false;

export async function connectDB(uri = process.env.MONGODB_URI, options = {}) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const primaryUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ogcrm';
  const defaultOptions = {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '10', 10),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // IPv4
    ...options
  };

  try {
    const conn = await mongoose.connect(primaryUri, defaultOptions);
    isConnected = true;
    logger.info({
      msg: 'MongoDB connected successfully',
      host: conn.connection.host,
      name: conn.connection.name,
      poolSize: defaultOptions.maxPoolSize
    });

    setupConnectionListeners();
    return conn;
  } catch (error) {
    const isLocalUri = primaryUri.includes('127.0.0.1') || primaryUri.includes('localhost');
    const allowFallback = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_DB_FALLBACK === 'true';

    if (!isLocalUri && allowFallback) {
      logger.warn({
        msg: 'Primary MongoDB connection failed (e.g. Atlas IP whitelist). Attempting fallback to local MongoDB...',
        primaryError: error.message
      });

      try {
        const fallbackUri = process.env.MONGODB_FALLBACK_URI || 'mongodb://127.0.0.1:27017/ogcrm';
        const conn = await mongoose.connect(fallbackUri, defaultOptions);
        isConnected = true;
        logger.info({
          msg: 'Connected to fallback local MongoDB successfully',
          host: conn.connection.host,
          name: conn.connection.name
        });

        setupConnectionListeners();
        return conn;
      } catch (fallbackError) {
        logger.error({
          msg: 'Both primary and fallback MongoDB connections failed',
          primaryError: error.message,
          fallbackError: fallbackError.message
        });
        throw error;
      }
    }

    logger.error({ msg: 'MongoDB connection failed', error: error.message });
    throw error;
  }
}

function setupConnectionListeners() {
  mongoose.connection.on('error', (err) => {
    logger.error({ msg: 'MongoDB connection error', err: err.message });
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn({ msg: 'MongoDB disconnected' });
    isConnected = false;
  });
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info({ msg: 'MongoDB disconnected gracefully' });
  }
}

export function isDbHealthy() {
  return mongoose.connection.readyState === 1;
}
