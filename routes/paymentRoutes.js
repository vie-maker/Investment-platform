
const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const {
  createPayPalOrder,
  capturePayPalOrder
} = require('../controllers/paymentController');

router.use(protect);

router.post('/create', createPayPalOrder);
router.post('/execute', capturePayPalOrder);

// Optional placeholders for now
router.post('/cancel', (req, res) => {
  res.status(200).json({ message: "Cancel payment (placeholder)" });
});
router.get('/status/:paymentId', (req, res) => {
  res.status(200).json({ message: `Status for ${req.params.paymentId}` });
});

module.exports = router;

