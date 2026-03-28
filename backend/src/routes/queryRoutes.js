import express from 'express';
import { createQuery, getMyQueries, getAllQueries, replyQuery } from '../controllers/queryController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Routes
router.post('/', protectStudent, createQuery);
router.get('/my', protectStudent, getMyQueries);

// Admin Routes
router.get('/admin/all', protect, getAllQueries);
router.put('/:id/reply', protect, replyQuery);

export default router;
