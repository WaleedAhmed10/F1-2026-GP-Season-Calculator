/**
 * Logging system with multiple log levels
 * Logs to console and can be extended for file/remote logging
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

const LOG_LEVEL_PRIORITY = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

class Logger {
  constructor(name = 'App', minLevel = 'INFO') {
    this.name = name;
    this.minLevel = minLevel;
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Format log message
   */
  format(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      logger: this.name,
      message,
      ...(data && Object.keys(data).length > 0 && { data })
    };
  }

  /**
   * Output log
   */
  output(level, message, data) {
    if (!this.shouldLog(level)) return;

    const log = this.format(level, message, data);
    const output = `[${log.timestamp}] [${level}] [${this.name}] ${message}`;

    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m', // Yellow
      INFO: '\x1b[36m', // Cyan
      DEBUG: '\x1b[35m', // Magenta
      TRACE: '\x1b[37m' // White
    };

    const reset = '\x1b[0m';
    const color = colors[level];

    if (data && Object.keys(data).length > 0) {
      console.log(`${color}${output}${reset}`, data);
    } else {
      console.log(`${color}${output}${reset}`);
    }
  }

  error(message, data) {
    this.output(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this.output(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this.output(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    this.output(LOG_LEVELS.DEBUG, message, data);
  }

  trace(message, data) {
    this.output(LOG_LEVELS.TRACE, message, data);
  }

  /**
   * Log HTTP request
   */
  logRequest(req) {
    this.info(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100)
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(req, res, duration) {
    this.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  }

  /**
   * Log database operation
   */
  logQuery(model, operation, duration, error = null) {
    const level = error ? 'ERROR' : 'DEBUG';
    const logFn = level === 'ERROR' ? this.error : this.debug;
    logFn.call(this, `DB: ${model}.${operation}`, {
      model,
      operation,
      duration: `${duration}ms`,
      ...(error && { error: error.message })
    });
  }

  /**
   * Log performance metric
   */
  logMetric(name, value, unit = 'ms') {
    this.debug(`Metric: ${name}`, {
      name,
      value,
      unit
    });
  }
}

/**
 * Request logging middleware
 */
function requestLogger(logger) {
  return (req, res, next) => {
    const startTime = Date.now();
    logger.logRequest(req);

    const originalJson = res.json;
    res.json = function (data) {
      const duration = Date.now() - startTime;
      logger.logResponse(req, res, duration);
      return originalJson.call(this, data);
    };

    next();
  };
}

// Export singleton logger instance
const logger = new Logger('F1-Predictor', process.env.LOG_LEVEL || 'INFO');

module.exports = {
  Logger,
  logger,
  requestLogger,
  LOG_LEVELS
};
