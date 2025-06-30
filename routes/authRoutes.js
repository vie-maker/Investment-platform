const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');

// Validation middleware
const validateRegister = [
  body('firstName').notEmpty().trim().escape().withMessage('First name is required'),
  body('lastName').notEmpty().trim().escape().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('country').notEmpty().trim().escape().withMessage('Country is required'),
  body('currency').notEmpty().trim().escape().withMessage('Currency is required')
];

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', resendVerification);
router.get('/verify-email', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/verify', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', userId: req.userId });
});

module.exports = router;