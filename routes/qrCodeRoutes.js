import express from 'express';
import {
  createQRCode,
  getUserQRCodes,
  deleteQRCode,
  getQRCodeById,
  togglePauseQRCode,
  updateQRCode,
  getQRCodeAnalytics,
  getQRCodeRealTimeAnalytics,
  getUserScanAnalytics,
  redirectQRCode,
  getQRCodePublic
} from '../controllers/qrCodeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/create', authMiddleware, createQRCode);
router.put('/:id', authMiddleware, updateQRCode);
router.get('/user', authMiddleware, getUserQRCodes);
router.get('/:id', authMiddleware, getQRCodeById)
router.get('/public/:shortCode', getQRCodePublic);
router.get('/redirect/:shortCode', redirectQRCode);
router.delete('/:id', authMiddleware, deleteQRCode);
router.patch('/pause/:id', authMiddleware, togglePauseQRCode);
router.get('/analytics/:id', authMiddleware, getQRCodeAnalytics);
router.get('/realtime-analytics/:id', authMiddleware, getQRCodeRealTimeAnalytics);
router.get('/user/analytics', authMiddleware, getUserScanAnalytics);

export default router;