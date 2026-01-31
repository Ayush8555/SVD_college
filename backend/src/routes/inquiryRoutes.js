import express from 'express';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateInquiry } from '../middleware/validators.js';

const router = express.Router();

// Public route to submit inquiry (with validation)
router.post('/', validateInquiry, createInquiry);

// Protected admin routes to view and manage inquiries
router.get('/', protect, getAllInquiries);
router.put('/:id', protect, updateInquiryStatus);

export default router;

