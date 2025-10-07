const rateLimit = require('express-rate-limit');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many sensitive operations from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many sensitive operations from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Auth rate limiter (for login, register, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts from this IP, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 upload requests per windowMs
  message: {
    success: false,
    message: 'Too many file upload attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many file upload attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Search rate limiter (more lenient for search operations)
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 200 : 30, // More lenient in development
  message: {
    success: false,
    message: 'Too many search requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests from this IP, please try again later.',
      retryAfter: '1 minute'
    });
  }
});

// No-op rate limiter for development (completely bypasses rate limiting)
const noOpLimiter = (req, res, next) => {
  next();
};

module.exports = {
  generalLimiter: isDevelopment ? noOpLimiter : generalLimiter,
  strictLimiter: isDevelopment ? noOpLimiter : strictLimiter,
  authLimiter: isDevelopment ? noOpLimiter : authLimiter,
  passwordResetLimiter: isDevelopment ? noOpLimiter : passwordResetLimiter,
  uploadLimiter: isDevelopment ? noOpLimiter : uploadLimiter,
  searchLimiter: isDevelopment ? noOpLimiter : searchLimiter
};

