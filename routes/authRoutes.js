const express = require('express');
const router = express.Router();
const { register, login, verifyEmailVerificationOtp, verifyForgotPasswordOtp, requestForgotPassword, resetPassword, resendEmailVerificationOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email-otp', verifyEmailVerificationOtp);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/request-forgot-password-otp', requestForgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-email-otp', resendEmailVerificationOtp);

module.exports = router;
