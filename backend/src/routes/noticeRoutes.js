import express from 'express';
import {
  getNotices,
  getAdminNotices,
  createNotice,
  deleteNotice,
  toggleNoticeStatus
} from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getNotices);

import { uploadNoticeImage } from '../middleware/publicUploadMiddleware.js';

// Admin routes
router.get('/admin', protect, getAdminNotices);
router.post('/', protect, uploadNoticeImage, createNotice);
router.delete('/:id', protect, deleteNotice);
router.put('/:id/toggle', protect, toggleNoticeStatus);

export default router;
