import express from 'express';
import {
  getNotices,
  getAdminNotices,
  createNotice,
  deleteNotice,
  toggleNoticeStatus,
  updateNotice
} from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadNoticeImage } from '../middleware/publicUploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getNotices);

// Admin routes
router.get('/admin', protect, getAdminNotices);
router.post('/', protect, uploadNoticeImage, createNotice);
router.put('/:id', protect, uploadNoticeImage, updateNotice);
router.delete('/:id', protect, deleteNotice);
router.put('/:id/toggle', protect, toggleNoticeStatus);

export default router;


