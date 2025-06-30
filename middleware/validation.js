
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  next();
};

// Investment validation rules
exports.validateInvestment = [
  body('plan.name').notEmpty().withMessage('Plan name is required'),
  body('plan.dailyReturn').isFloat({ min: 0, max: 100 }).withMessage('Daily return must be between 0 and 100'),
  body('plan.duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
];

// User registration validation
exports.validateRegistration = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
];

// Login validation
exports.validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Withdrawal validation
exports.validateWithdrawal = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('method').notEmpty().withMessage('Payment method is required'),
];
