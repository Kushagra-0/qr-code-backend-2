import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../utils/s3.js";
import { uploadImage, uploadPdf, uploadAudio, uploadImageLogo } from "../controllers/uploadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "qrsonly-bucket",
        key: (req, file, cb) => {
            let folder = "general";
            if (req.originalUrl.includes("/logo/image")) folder = "qr-image-logo";
            else if (req.originalUrl.includes("/image")) folder = "qr-image";
            else if (req.originalUrl.includes("/pdf")) folder = "qr-pdfs";
            else if (req.originalUrl.includes("/audio")) folder = "qr-audios";

            const ext = file.originalname.split(".").pop();
            const filename = `${Date.now().toString()}.${ext}`;
            const key = `${folder}/${filename}`;
            cb(null, key);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
});

// Authenticated upload (so each user uploads their own logos)
router.post("/logo/image", authMiddleware, upload.single("file"), uploadImageLogo);
router.post("/image", authMiddleware, upload.single("file"), uploadImage);
router.post("/pdf", authMiddleware, upload.single("file"), uploadPdf);
router.post("/audio", authMiddleware, upload.single("file"), uploadAudio);

export default router;