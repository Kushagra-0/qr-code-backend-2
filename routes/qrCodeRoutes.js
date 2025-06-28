const express = require('express');
const router = express.Router();
const {
  createQRCode,
  getUserQRCodes,
  deleteQRCode,
  redirectToContent,
  getQRCodeById,
  togglePauseQRCode,
  updateQRCode
} = require('../controllers/qrCodeController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.post('/create', authMiddleware, createQRCode);
router.put('/:id', authMiddleware, updateQRCode);
router.get('/user', authMiddleware, getUserQRCodes);
router.get('/:id', authMiddleware, getQRCodeById)
router.get('/redirect/:id', redirectToContent);
router.delete('/:id', authMiddleware, deleteQRCode);
router.patch('/pause/:id', authMiddleware, togglePauseQRCode);
router.get('/analytics/:id', authMiddleware, )

module.exports = router;
