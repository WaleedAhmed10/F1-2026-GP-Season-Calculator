/**
 * Custom error classes for consistent error handling
 */

/**
 * Base API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends APIError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends APIError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal server error', originalError = null) {
    super(message, 500);
    this.name = 'InternalServerError';
    this.originalError = originalError;
  }
}

/**
 * Global error handling middleware
 * Should be used as the last middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error('[ERROR]', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode || 500,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      timestamp: err.timestamp,
      ...(err.retryAfter && { retryAfter: err.retryAfter })
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.entries(err.errors).reduce((acc, [key, val]) => {
      acc[key] = val.message;
      return acc;
    }, {});
    return res.status(400).json({
      error: 'Validation failed',
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `${field} already exists`,
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
}

/**
 * Async route handler wrapper to catch errors
 * @param {Function} fn - Route handler function
 * @returns {Function} Wrapped handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  errorHandler,
  asyncHandler
};
