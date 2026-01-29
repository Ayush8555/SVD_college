import express from 'express';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to submit inquiry
router.post('/', createInquiry);

// Protected admin routes to view and manage inquiries
router.get('/', protect, getAllInquiries);
router.put('/:id', protect, updateInquiryStatus);

export default router;
