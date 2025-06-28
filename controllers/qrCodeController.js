const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');

const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

// Create a QR Code
const createQRCode = async (req, res) => {
  const { content, color, isDynamic, expiresAt } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ message: 'Type and content are required.' });
  }

  try {
    const qrCode = await QRCode.create({
      userId,
      content,
      color,
      isDynamic,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    res.status(201).json({ message: 'QR Code created successfully.', qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // Only allow the owner to update
    if (qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { content, color, expiresAt } = req.body;

    if (content !== undefined) qrCode.content = content;
    if (color !== undefined) qrCode.color = color;
    if (expiresAt !== undefined)
      qrCode.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await qrCode.save();

    res.status(200).json({ message: "QR Code updated successfully", qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const redirectToContent = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) return res.status(404).json({ message: "QR Code not found" });

    if (!qrCode.isDynamic) {
      return res.status(400).json({ message: "Not a dynamic QR code" });
    }

    if (qrCode.isPaused) {
      return res.status(403).json({ message: "QR Code is currently paused" });
    }

    if (qrCode.expiresAt && new Date() > new Date(qrCode.expiresAt)) {
      return res.status(410).json({ message: "QR Code has expired" });
    }

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const referrer = req.headers["referer"] || null;

    const geo = geoip.lookup(ip);
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    await Scan.create({
      qrCodeId: qrCode._id,
      ip,
      userAgent,
      deviceType: result.device.type || "desktop",
      browser: result.browser.name || "Unknown",
      os: result.os.name || "Unknown",
      referrer,
      location: {
        country: geo?.country || "Unknown",
        city: geo?.city || "Unknown",
      },
    })

    qrCode.scanCount += 1;
    await qrCode.save();

    // Return URL instead of redirect
    res.status(200).json({ url: qrCode.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createQRCode, redirectToContent };

// Get all QR Codes by User
const getUserQRCodes = async (req, res) => {
  const userId = req.user.userId;

  try {
    const qrCodes = await QRCode.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(qrCodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getQRCodesAnalytics = async (req, res) => {
  try {
    const scans = await Scan.find({ qrCodeId: req.params.id });

    const totalScans = scans.length;

    const byDate = {};
    scans.forEach(scan => {
      const date = new Date(scan.scannedAt).toLocaleDateString();
      byDate[date] = (byDate[date] || 0) + 1;
    });

    res.json({
      totalScans,
      scansOverTime: byDate,
      recentScans: scans.slice(-10).reverse(), // last 10
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching analytics.");
  }
}

const deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // Optional: Only allow deletion if the logged-in user created it
    if (qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this QR code' });
    }

    await QRCode.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'QR Code deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this QR Code' });
    }

    res.status(200).json(qrCode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const togglePauseQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) return res.status(404).json({ message: "QR Code not found" });

    if (qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    qrCode.isPaused = !qrCode.isPaused;
    await qrCode.save();

    res.status(200).json({ message: `QR Code ${qrCode.isPaused ? "paused" : "resumed"}`, qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createQRCode,
  updateQRCode,
  getUserQRCodes,
  getQRCodeById,
  deleteQRCode,
  redirectToContent,
  togglePauseQRCode
};
