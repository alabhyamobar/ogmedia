import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB(uri = process.env.MONGODB_URI, options = {}) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const defaultOptions = {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '10', 10),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // IPv4
    ...options
  };

  try {
    const conn = await mongoose.connect(uri, defaultOptions);
    isConnected = true;
    logger.info({
      msg: 'MongoDB connected successfully',
      host: conn.connection.host,
      name: conn.connection.name,
      poolSize: defaultOptions.maxPoolSize
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ msg: 'MongoDB connection error', err: err.message });
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn({ msg: 'MongoDB disconnected' });
      isConnected = false;
    });

    return conn;
  } catch (error) {
    logger.error({ msg: 'MongoDB connection failed', error: error.message });
    throw error;
  }
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
