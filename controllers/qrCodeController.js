const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');

const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { nanoid } = require("nanoid");

const generateUniqueShortCode = async () => {
  let shortCode;
  let isUnique = false;

  while (!isUnique) {
    shortCode = nanoid(7); // e.g., 'xYz9W1a'
    const existing = await QRCode.findOne({ shortCode });
    if (!existing) isUnique = true;
  }

  return shortCode;
};

// Create a QR Code
const createQRCode = async (req, res) => {
  const { name, content, backgroundColor, dotType, dotColor, cornersSquareType, cornersSquareColor, cornersDotType, cornersDotColor, isDynamic, expiresAt } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ message: 'Type and content are required.' });
  }

  try {
    const shortCode = await generateUniqueShortCode();

    const qrCode = await QRCode.create({
      userId,
      shortCode,
      name,
      content,
      backgroundColor,
      dotType,
      dotColor,
      cornersSquareType,
      cornersSquareColor,
      cornersDotType,
      cornersDotColor,
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

    const { name, content, backgroundColor, dotType, dotColor, cornersSquareType, cornersSquareColor, cornersDotType, cornersDotColor, expiresAt } = req.body;

    if (name !== undefined) qrCode.name = name;
    if (content !== undefined) qrCode.content = content;
    if (backgroundColor !== undefined) qrCode.backgroundColor = backgroundColor;
    if (dotType !== undefined) qrCode.dotType = dotType;
    if (dotColor !== undefined) qrCode.dotColor = dotColor;
    if (cornersSquareType !== undefined) qrCode.cornersSquareType = cornersSquareType;
    if (cornersSquareColor !== undefined) qrCode.cornersSquareColor = cornersSquareColor;
    if (cornersDotType !== undefined) qrCode.cornersDotType = cornersDotType;
    if (cornersDotColor !== undefined) qrCode.cornersDotColor = cornersDotColor;
    if (expiresAt !== undefined) qrCode.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await qrCode.save();

    res.status(200).json({ message: "QR Code updated successfully", qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const redirectToContent = async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({ shortCode: req.params.shortCode });

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

const getQRCodeAnalytics = async (req, res) => {
  try {
    const qrCodeId = req.params.id;
    
    // Verify ownership
    const qrCode = await QRCode.findById(qrCodeId);
    if (!qrCode || qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const scans = await Scan.find({ qrCodeId }).sort({ scannedAt: -1 });
    const totalScans = scans.length;

    // 1. Scans Over Time (Daily)
    const scansOverTime = {};
    const last30Days = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days[dateStr] = 0;
    }

    scans.forEach(scan => {
      const date = new Date(scan.scannedAt).toISOString().split('T')[0];
      scansOverTime[date] = (scansOverTime[date] || 0) + 1;
      if (last30Days.hasOwnProperty(date)) {
        last30Days[date]++;
      }
    });

    // 2. Device Type Analytics
    const deviceTypes = {};
    scans.forEach(scan => {
      const device = scan.deviceType || 'desktop';
      deviceTypes[device] = (deviceTypes[device] || 0) + 1;
    });

    // 3. Browser Analytics
    const browsers = {};
    scans.forEach(scan => {
      const browser = scan.browser || 'Unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;
    });

    // 4. Operating System Analytics
    const operatingSystems = {};
    scans.forEach(scan => {
      const os = scan.os || 'Unknown';
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
    });

    // 5. Geographic Analytics
    const countries = {};
    const cities = {};
    scans.forEach(scan => {
      const country = scan.location?.country || 'Unknown';
      const city = scan.location?.city || 'Unknown';
      
      countries[country] = (countries[country] || 0) + 1;
      cities[city] = (cities[city] || 0) + 1;
    });

    // 6. Hourly Distribution
    const hourlyDistribution = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }
    
    scans.forEach(scan => {
      const hour = new Date(scan.scannedAt).getHours();
      hourlyDistribution[hour]++;
    });

    // 7. Peak Performance Metrics
    const currentDate = new Date();
    const last7Days = scans.filter(scan => {
      const scanDate = new Date(scan.scannedAt);
      const diffTime = Math.abs(currentDate - scanDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const last24Hours = scans.filter(scan => {
      const scanDate = new Date(scan.scannedAt);
      const diffTime = Math.abs(currentDate - scanDate);
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return diffHours <= 24;
    }).length;

    // 8. Unique Visitors (approximate based on IP + UserAgent)
    const uniqueVisitors = new Set();
    scans.forEach(scan => {
      const fingerprint = `${scan.ip}-${scan.userAgent}`;
      uniqueVisitors.add(fingerprint);
    });

    // 9. Top Referrers
    const referrers = {};
    scans.forEach(scan => {
      if (scan.referrer) {
        try {
          const domain = new URL(scan.referrer).hostname;
          referrers[domain] = (referrers[domain] || 0) + 1;
        } catch (e) {
          referrers['Direct'] = (referrers['Direct'] || 0) + 1;
        }
      } else {
        referrers['Direct'] = (referrers['Direct'] || 0) + 1;
      }
    });

    // 10. Recent Activity
    const recentScans = scans.slice(0, 10).map(scan => ({
      scannedAt: scan.scannedAt,
      deviceType: scan.deviceType,
      browser: scan.browser,
      os: scan.os,
      country: scan.location?.country,
      city: scan.location?.city
    }));

    // 11. Growth Rate (compared to previous period)
    const previousPeriodScans = scans.filter(scan => {
      const scanDate = new Date(scan.scannedAt);
      const diffTime = Math.abs(currentDate - scanDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 30 && diffDays <= 60;
    }).length;

    const growthRate = previousPeriodScans > 0 
      ? ((last30Days - previousPeriodScans) / previousPeriodScans * 100).toFixed(1)
      : 0;

    res.json({
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        shortCode: qrCode.shortCode,
        createdAt: qrCode.createdAt
      },
      summary: {
        totalScans,
        uniqueVisitors: uniqueVisitors.size,
        last24Hours,
        last7Days,
        growthRate: parseFloat(growthRate)
      },
      charts: {
        scansOverTime: last30Days,
        deviceTypes,
        browsers,
        operatingSystems,
        countries,
        cities,
        hourlyDistribution,
        referrers
      },
      recentActivity: recentScans,
      metadata: {
        dataRange: {
          from: scans.length > 0 ? scans[scans.length - 1].scannedAt : null,
          to: scans.length > 0 ? scans[0].scannedAt : null
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

const getQRCodeRealTimeAnalytics = async (req, res) => {
  try {
    const qrCodeId = req.params.id;
    
    // Verify ownership
    const qrCode = await QRCode.findById(qrCodeId);
    if (!qrCode || qrCode.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const now = new Date();
    const last5Minutes = new Date(now - 5 * 60 * 1000);
    const lastHour = new Date(now - 60 * 60 * 1000);
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

    const [recent5Min, lastHourScans, last24HourScans] = await Promise.all([
      Scan.countDocuments({ qrCodeId, scannedAt: { $gte: last5Minutes } }),
      Scan.countDocuments({ qrCodeId, scannedAt: { $gte: lastHour } }),
      Scan.countDocuments({ qrCodeId, scannedAt: { $gte: last24Hours } })
    ]);

    res.json({
      realTime: {
        last5Minutes: recent5Min,
        lastHour: lastHourScans,
        last24Hours: last24HourScans,
        timestamp: now.toISOString()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching real-time analytics' });
  }
};

module.exports = {
  createQRCode,
  updateQRCode,
  getUserQRCodes,
  getQRCodeById,
  deleteQRCode,
  redirectToContent,
  togglePauseQRCode,
  getQRCodeAnalytics,
  getQRCodeRealTimeAnalytics,
};
