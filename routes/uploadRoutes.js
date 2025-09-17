import express from "express";
import multer from "multer";
import { uploadImage, uploadPdf, uploadAudio, uploadImageLogo } from "../controllers/uploadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });

// Authenticated upload (so each user uploads their own logos)
router.post("/logo/image", authMiddleware, upload.single("file"), uploadImageLogo);
router.post("/image", authMiddleware, upload.single("file"), uploadImage);
router.post("/pdf", authMiddleware, upload.single("file"), uploadPdf);
router.post("/audio", authMiddleware, upload.single("file"), uploadAudio);

export default router;