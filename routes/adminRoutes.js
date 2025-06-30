const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin', 'superadmin'));

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);

// User management routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Transaction management routes
router.get('/transactions', adminController.getAllTransactions);
router.patch('/transactions/:transactionId/status', adminController.updateTransactionStatus);

module.exports = router;