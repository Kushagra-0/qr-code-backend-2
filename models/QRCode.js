const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            default: '#000000',
        },
        isDynamic: {
            type: Boolean,
            default: false,
        },
        isPaused: {
            type: Boolean,
            default: false,
        },
        scanCount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

const QRCode = mongoose.model('QRCode', qrCodeSchema);
module.exports = QRCode;