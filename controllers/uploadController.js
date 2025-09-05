const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "qr-image-logo",
            resource_type: "image",
        });

        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Logo upload failed" });
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "qr-image",
            resource_type: "image",
        });

        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Logo upload failed" });
    }
};

const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "qr-pdfs",
            resource_type: "auto", // 👈 required for non-image files
            public_id: Date.now().toString(),
            format: "pdf",
        });

        console.log("Cloudinary upload result:", result);

        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("PDF upload error:", err);
        res.status(500).json({ message: "PDF upload failed" });
    }
};

const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "qr-audios",
      resource_type: "auto", // auto works fine for audio
      public_id: Date.now().toString(),
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Audio upload error:", err);
    res.status(500).json({ message: "Audio upload failed" });
  }
};


module.exports = { uploadImageLogo, uploadImage, uploadPdf, uploadAudio };