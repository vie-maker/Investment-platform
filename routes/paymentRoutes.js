
const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const {
  createPayment,
  executePayment,
  cancelPayment,
  getPaymentStatus
} = require('../controllers/paymentController');

// Protect all routes
router.use(protect);

router.post('/create', createPayment);
router.post('/execute', executePayment);
router.post('/cancel', cancelPayment);
router.get('/status/:paymentId', getPaymentStatus);

module.exports = router;
