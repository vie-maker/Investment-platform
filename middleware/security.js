
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Set security headers
const setSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://js.paypal.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paypal.com", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://www.paypal.com"]
    }
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Data sanitization against NoSQL query injection
const sanitizeData = mongoSanitize();

// Data sanitization against XSS
const xssProtection = xss();

// Prevent parameter pollution
const preventParamPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit']
});

module.exports = {
  setSecurityHeaders,
  limiter,
  sanitizeData,
  xssProtection,
  preventParamPollution
};
