
const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const {
  getProfile,
  updateProfile,
  getInvestments,
  createInvestment,
  getTransactions,
  getBalance,
  requestWithdrawal
} = require('../controllers/userController');

// Protect all routes after this middleware
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/investments', getInvestments);
router.post('/investments', createInvestment);
router.get('/transactions', getTransactions);
router.get('/balance', getBalance);
router.post('/withdraw', requestWithdrawal);

module.exports = router;
