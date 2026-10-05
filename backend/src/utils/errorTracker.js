/**
 * In-memory circular error buffer for developer diagnostics & live system debugging.
 * Stores up to MAX_ERRORS recent server & queue exceptions with full stack traces.
 */
const MAX_ERRORS = 50;
const errorLogs = [];

/**
 * Record an exception into the developer debug buffer
 */
export function recordError(err, req = null) {
  if (!err) return null;

  const errorItem = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    message: err.message || String(err) || 'Unknown error occurred',
    code: err.code || err.name || 'INTERNAL_ERROR',
    statusCode: err.statusCode || (err.name === 'ZodError' ? 400 : 500),
    stack: err.stack || null,
    method: req?.method || null,
    url: req?.originalUrl || req?.url || null,
    ip: req?.ip || null,
    requestId: req?.id || null,
    user: req?.user
      ? {
          id: req.user._id,
          username: req.user.username,
          role: req.user.role
        }
      : null,
    query: req?.query && Object.keys(req.query).length > 0 ? req.query : null,
    body: req?.body && Object.keys(req.body).length > 0 ? sanitizePayload(req.body) : null
  };

  errorLogs.unshift(errorItem);
  if (errorLogs.length > MAX_ERRORS) {
    errorLogs.pop();
  }

  return errorItem;
}

/**
 * Redact sensitive credential keys from payload dumps
 */
function sanitizePayload(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'currentPassword', 'newPassword', 'confirmPassword'];
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Return all recorded errors (most recent first)
 */
export function getErrorLogs() {
  return errorLogs;
}

/**
 * Clear all recorded error logs from the memory buffer
 */
export function clearErrorLogs() {
  errorLogs.length = 0;
  return true;
}
