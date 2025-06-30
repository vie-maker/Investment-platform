
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const {
  createPayment,
  executePayment,
  cancelPayment
} = require('../controllers/paymentController');

// Protect all routes
router.use(verifyToken);

// Payment routes
router.post('/create', createPayment);
router.post('/execute', executePayment);
router.post('/cancel', cancelPayment);

module.exports = router;
