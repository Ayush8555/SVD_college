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

// Admin routes
router.get('/admin', protect, getAdminNotices);
router.post('/', protect, createNotice);
router.delete('/:id', protect, deleteNotice);
router.put('/:id/toggle', protect, toggleNoticeStatus);

export default router;
