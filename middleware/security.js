const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Set security HTTP headers
exports.setSecurityHeaders = helmet();

// Limit requests from same API
exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Data sanitization against NoSQL query injection
exports.sanitizeData = mongoSanitize();

// Data sanitization against XSS
exports.xssProtection = xss();

// Prevent parameter pollution
exports.preventParamPollution = hpp();