const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route example
router.get('/verify', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', userId: req.userId });
});

module.exports = router;