export const uploadImageLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ url: req.file.location }); // S3 file URL
  } catch (err) {
    res.status(500).json({ message: "Logo upload failed" });
  }
};

export const uploadImageBlog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ url: req.file.location }); // S3 file URL
  } catch (err) {
    res.status(500).json({ message: "Logo upload failed" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ url: req.file.location });
  } catch (err) {
    res.status(500).json({ message: "Image upload failed" });
  }
};

export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ url: req.file.location });
  } catch (err) {
    res.status(500).json({ message: "PDF upload failed" });
  }
};

export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }


    res.status(200).json({ url: req.file.location });
  } catch (err) {
    res.status(500).json({ message: "Audio upload failed" });
  }
};
