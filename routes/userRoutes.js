
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const {
  getProfile,
  updateProfile,
  getInvestments,
  createInvestment,
  getTransactions,
  createWithdrawal,
  getWithdrawals
} = require('../controllers/userController');

// Protect all routes
router.use(verifyToken);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Investment routes
router.get('/investments', getInvestments);
router.post('/investments', createInvestment);

// Transaction routes
router.get('/transactions', getTransactions);

// Withdrawal routes
router.get('/withdrawals', getWithdrawals);
router.post('/withdrawals', createWithdrawal);

module.exports = router;
