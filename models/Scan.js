import mongoose from "mongoose"

const scanSchema = new mongoose.Schema(
    {
        qrCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QRCode",
            required: true,
        },
        ip: {
            String,
        },
        userAgent: {
            type: String,
        },
        deviceType: {
            type: String,
        },
        browser: {
            type: String,
        },
        os: {
            type: String,
        },
        referrer: {
            type: String,
        },
        location: {
            country: String,
            city: String,
        },
        scannedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Scan = mongoose.model("Scan", scanSchema);
export default Scan;