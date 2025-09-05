const express = require("express");
const multer = require("multer");
const { uploadImage, uploadPdf, uploadAudio, uploadImageLogo } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });

// Authenticated upload (so each user uploads their own logos)
router.post("/logo/image", authMiddleware, upload.single("file"), uploadImageLogo);
router.post("/image", authMiddleware, upload.single("file"), uploadImage);
router.post("/pdf", authMiddleware, upload.single("file"), uploadPdf);
router.post("/audio", authMiddleware, upload.single("file"), uploadAudio);

module.exports = router;