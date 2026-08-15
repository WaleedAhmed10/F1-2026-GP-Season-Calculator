/**
 * Validation middleware for input sanitization and validation
 * Prevents common attacks and ensures data integrity
 */

const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-30 alphanumeric characters'
  },
  password: {
    minLength: 8,
    maxLength: 256,
    message: 'Password must be 8-256 characters'
  },
  displayName: {
    minLength: 1,
    maxLength: 100,
    message: 'Display name must be 1-100 characters'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  driverId: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Invalid driver ID format'
  },
  raceId: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Invalid race ID format'
  }
};

/**
 * Sanitize string input by removing potentially harmful characters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .substring(0, 500); // Limit length
}

/**
 * Validate string against rule
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {{valid: boolean, error: string | null}}
 */
function validateField(value, fieldName) {
  if (!VALIDATION_RULES[fieldName]) {
    return { valid: true, error: null };
  }

  const rule = VALIDATION_RULES[fieldName];

  if (rule.minLength && value.length < rule.minLength) {
    return { valid: false, error: rule.message };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return { valid: false, error: rule.message };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, error: rule.message };
  }

  return { valid: true, error: null };
}

/**
 * Middleware to validate request body fields
 * @param {Array<string>} fields - Fields to validate
 * @returns {Function} Express middleware
 */
function validateBody(fields) {
  return (req, res, next) => {
    const errors = {};

    fields.forEach((field) => {
      const value = req.body[field];

      // Check required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${field} is required`;
        return;
      }

      // Sanitize and validate
      if (typeof value === 'string') {
        req.body[field] = sanitizeString(value);
        const validation = validateField(req.body[field], field);
        if (!validation.valid) {
          errors[field] = validation.error;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}

/**
 * Validate query parameters
 * @param {Object} params - Parameters to validate {fieldName: 'type'}
 * @returns {Function} Express middleware
 */
function validateQuery(params) {
  return (req, res, next) => {
    const errors = {};

    Object.entries(params).forEach(([field, type]) => {
      const value = req.query[field];

      if (type === 'required' && !value) {
        errors[field] = `${field} is required`;
        return;
      }

      if (value && type === 'number' && isNaN(Number(value))) {
        errors[field] = `${field} must be a number`;
      }

      if (value && type === 'string' && typeof value === 'string') {
        req.query[field] = sanitizeString(value);
      }
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateField,
  sanitizeString,
  VALIDATION_RULES
};
