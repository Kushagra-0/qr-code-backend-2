import mongoose from "mongoose"

const otpSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['email_verification', 'forgot_password'],
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;