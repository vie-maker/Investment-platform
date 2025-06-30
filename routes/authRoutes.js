
const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword, verifyEmail } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/verify-email/:token', verifyEmail);

module.exports = router;
