import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

import systemRoutes from './routes/system.routes.js';
import publicLeadRoutes from './routes/publicLead.routes.js';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';

dotenv.config();

export function createApp() {
  const app = express();

  // Trust proxy for rate limiting behind load balancers / reverse proxies
  app.set('trust proxy', 1);

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed by frontend bundle or proxy
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS Configuration
  const normalizeOrigin = (url) => (url ? url.trim().replace(/\/+$/, '') : '');

  // Default allowed origins for local dev, official production Vercel deployment, and Render backend
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://ogmedia-theta.vercel.app',
    'https://ogmedia-6uxn.onrender.com'
  ];

  // Additional origins parsed from FRONTEND_URL env var if provided
  const configuredOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(normalizeOrigin).filter(Boolean)
    : [];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = normalizeOrigin(origin);

        // Check explicit allowed origins
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        // Allow any ogmedia vercel preview or production deployment
        if (/^https:\/\/ogmedia(-[a-z0-9_-]+)?\.vercel\.app$/i.test(normalizedOrigin)) {
          return callback(null, true);
        }

        return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept'],
      exposedHeaders: ['X-Request-Id']
    })
  );

  // Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Structured Request Logger
  app.use(requestLogger);

  // Mount API Routes
  app.use('/', systemRoutes);
  app.use('/api/v1/public', publicLeadRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/leads', leadRoutes);
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/audit-logs', auditLogRoutes);

  // 404 Route Not Found Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
      },
      requestId: req.id
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
