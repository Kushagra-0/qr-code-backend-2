const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shortCode: {
            type: String,
            requied: true,
            unique: true,
        },
        name: {
            type: String,
        },
        content: {
            type: String,
            required: true,
        },
        backgroundColor: {
            type: String,
            default: '#ffffff',
        },
        dotType: {
            type: String,
            enum: ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'],
            default: 'square',
        },
        dotColor: {
            type: String,
            default: '#000000',
        },
        cornersSquareType: {
            type: String,
            enum: ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'],
            default: 'square',
        },
        cornersSquareColor: {
            type: String,
            default: '#000000',
        },
        cornersDotType: {
            type: String,
            enum: ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'],
            default: 'square',
        },
        cornersDotColor: {
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