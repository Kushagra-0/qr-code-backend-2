const express = require('express');
const router = express.Router();
const { register, login, verifyEmailVerificationOtp, verifyForgotPasswordOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email-otp', verifyEmailVerificationOtp);
router.post('/verify-password-otp', verifyForgotPasswordOtp)

module.exports = router;
