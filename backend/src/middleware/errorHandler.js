import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { recordError } from '../utils/errorTracker.js';

export function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestId = req.id || 'unknown';

  // Record error in developer debug buffer
  try {
    recordError(err, req);
  } catch {}

  // Handle Zod validation errors
  if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray(err.errors) || Array.isArray(err.issues)) {
    const rawIssues = Array.isArray(err.errors) ? err.errors : (Array.isArray(err.issues) ? err.issues : []);
    const formattedErrors = rawIssues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input payload.',
        details: formattedErrors
      },
      requestId
    });
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `An entity with this ${field} already exists.`
      },
      requestId
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid resource identifier format.'
      },
      requestId
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && isProduction ? 'An unexpected internal error occurred.' : err.message;

  logger.error({
    msg: 'Unhandled request error',
    requestId,
    statusCode,
    error: err.message,
    stack: isProduction ? undefined : err.stack
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    },
    requestId
  });
}
