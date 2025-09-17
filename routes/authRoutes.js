import express from 'express';
import {
    register,
    login,
    verifyEmailVerificationOtp,
    verifyForgotPasswordOtp,
    requestForgotPassword,
    resetPassword,
    resendEmailVerificationOtp,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email-otp', verifyEmailVerificationOtp);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/request-forgot-password-otp', requestForgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-email-otp', resendEmailVerificationOtp);

export default router;